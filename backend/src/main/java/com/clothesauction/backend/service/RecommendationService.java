package com.clothesauction.backend.service;

import com.clothesauction.backend.model.*;
import com.clothesauction.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public RecommendationService(ProductRepository productRepository,
                                  BidRepository bidRepository,
                                  UserRepository userRepository,
                                  OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public List<Product> getRecommendations(Long userId, int limit) {
        // Get all available products
        List<Product> allProducts = productRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProductStatus.AVAILABLE)
                .collect(Collectors.toList());

        if (userId == null) {
            // Guest: return latest products
            return allProducts.stream()
                    .sorted(Comparator.comparing(Product::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return allProducts.stream().limit(limit).collect(Collectors.toList());

        // 1. Get user's bid categories
        List<Bid> userBids = bidRepository.findByUser(user);
        List<Order> userOrders = orderRepository.findByUser(user);

        // 2. Build category score map
        Map<Category, Integer> categoryScore = new HashMap<>();

        for (Bid bid : userBids) {
            if (bid.getProduct() != null && bid.getProduct().getCategory() != null) {
                categoryScore.merge(bid.getProduct().getCategory(), 3, Integer::sum);
            }
        }

        for (Order order : userOrders) {
            if (order.getProduct() != null && order.getProduct().getCategory() != null) {
                categoryScore.merge(order.getProduct().getCategory(), 5, Integer::sum);
            }
        }

        // 3. Get already interacted product IDs
        Set<Long> interactedIds = new HashSet<>();
        userBids.forEach(b -> { if (b.getProduct() != null) interactedIds.add(b.getProduct().getId()); });
        userOrders.forEach(o -> { if (o.getProduct() != null) interactedIds.add(o.getProduct().getId()); });

        // 4. Score each product
        List<Product> candidates = allProducts.stream()
                .filter(p -> !interactedIds.contains(p.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) candidates = allProducts;

        // 5. Sort by category preference score
        if (!categoryScore.isEmpty()) {
            candidates.sort((a, b) -> {
                int scoreA = categoryScore.getOrDefault(a.getCategory(), 0);
                int scoreB = categoryScore.getOrDefault(b.getCategory(), 0);
                if (scoreB != scoreA) return scoreB - scoreA;
                // Secondary: prefer auctions
                if (Boolean.TRUE.equals(b.getIsAuction()) != Boolean.TRUE.equals(a.getIsAuction()))
                    return Boolean.TRUE.equals(b.getIsAuction()) ? 1 : -1;
                return 0;
            });
        } else {
            // No history: sort by newest + auctions first
            candidates.sort((a, b) -> {
                if (Boolean.TRUE.equals(b.getIsAuction()) != Boolean.TRUE.equals(a.getIsAuction()))
                    return Boolean.TRUE.equals(b.getIsAuction()) ? 1 : -1;
                if (a.getCreatedAt() != null && b.getCreatedAt() != null)
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                return 0;
            });
        }

        return candidates.stream().limit(limit).collect(Collectors.toList());
    }

    public List<Product> getSimilarProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return Collections.emptyList();

        return productRepository.findAll().stream()
                .filter(p -> !p.getId().equals(productId))
                .filter(p -> p.getStatus() == ProductStatus.AVAILABLE)
                .sorted((a, b) -> {
                    int scoreA = 0, scoreB = 0;
                    // Same category = high score
                    if (product.getCategory() != null && product.getCategory().equals(a.getCategory())) scoreA += 10;
                    if (product.getCategory() != null && product.getCategory().equals(b.getCategory())) scoreB += 10;
                    // Similar price range (within 50%)
                    if (product.getPrice() != null && a.getPrice() != null) {
                        double ratio = Math.abs(a.getPrice() - product.getPrice()) / product.getPrice();
                        if (ratio < 0.5) scoreA += 5;
                    }
                    if (product.getPrice() != null && b.getPrice() != null) {
                        double ratio = Math.abs(b.getPrice() - product.getPrice()) / product.getPrice();
                        if (ratio < 0.5) scoreB += 5;
                    }
                    // Same type (auction/buy)
                    if (Objects.equals(a.getIsAuction(), product.getIsAuction())) scoreA += 3;
                    if (Objects.equals(b.getIsAuction(), product.getIsAuction())) scoreB += 3;
                    return scoreB - scoreA;
                })
                .limit(limit)
                .collect(Collectors.toList());
    }
}
