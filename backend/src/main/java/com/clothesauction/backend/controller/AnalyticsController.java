package com.clothesauction.backend.controller;

import com.clothesauction.backend.repository.*;
import com.clothesauction.backend.model.ProductStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/analytics")
public class AnalyticsController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final BidRepository bidRepository;

    public AnalyticsController(ProductRepository productRepository, UserRepository userRepository,
                                OrderRepository orderRepository, BidRepository bidRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.bidRepository = bidRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalBids = bidRepository.count();
        long soldProducts = productRepository.findByStatus(ProductStatus.SOLD).size();
        long activeAuctions = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsAuction()) && p.getStatus() == ProductStatus.AVAILABLE)
                .count();

        double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0)
                .sum();

        // Conversion rate: users who placed at least one bid / total users
        long usersWithBids = bidRepository.findAll().stream()
                .map(b -> b.getUser() != null ? b.getUser().getId() : null)
                .filter(id -> id != null)
                .distinct().count();
        double conversionRate = totalUsers > 0 ? Math.round((usersWithBids * 100.0 / totalUsers) * 10.0) / 10.0 : 0;

        // Auction success rate: sold auctions / total auctions
        long totalAuctions = productRepository.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getIsAuction())).count();
        double auctionSuccessRate = totalAuctions > 0 ? Math.round((soldProducts * 100.0 / totalAuctions) * 10.0) / 10.0 : 0;

        // Average order value
        double avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100.0) / 100.0 : 0;

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalProducts", totalProducts);
        result.put("totalUsers", totalUsers);
        result.put("totalOrders", totalOrders);
        result.put("totalBids", totalBids);
        result.put("soldProducts", soldProducts);
        result.put("activeAuctions", activeAuctions);
        result.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        result.put("conversionRate", conversionRate);
        result.put("auctionSuccessRate", auctionSuccessRate);
        result.put("avgOrderValue", avgOrderValue);
        result.put("usersWithBids", usersWithBids);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyData() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM");
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        // Monthly orders
        Map<String, Long> monthlyOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderTime() != null && o.getOrderTime().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        o -> o.getOrderTime().format(fmt),
                        Collectors.counting()
                ));

        // Monthly revenue
        Map<String, Double> monthlyRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getOrderTime() != null && o.getOrderTime().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        o -> o.getOrderTime().format(fmt),
                        Collectors.summingDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0)
                ));

        // Monthly users
        Map<String, Long> monthlyUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        u -> u.getCreatedAt().format(fmt),
                        Collectors.counting()
                ));

        // Monthly bids
        Map<String, Long> monthlyBids = bidRepository.findAll().stream()
                .filter(b -> b.getBidTime() != null && b.getBidTime().isAfter(sixMonthsAgo))
                .collect(Collectors.groupingBy(
                        b -> b.getBidTime().format(fmt),
                        Collectors.counting()
                ));

        // Generate last 6 months labels
        List<String> labels = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            labels.add(LocalDateTime.now().minusMonths(i).format(fmt));
        }

        return ResponseEntity.ok(Map.of(
                "labels", labels,
                "orders", labels.stream().map(l -> monthlyOrders.getOrDefault(l, 0L)).collect(Collectors.toList()),
                "revenue", labels.stream().map(l -> monthlyRevenue.getOrDefault(l, 0.0)).collect(Collectors.toList()),
                "users", labels.stream().map(l -> monthlyUsers.getOrDefault(l, 0L)).collect(Collectors.toList()),
                "bids", labels.stream().map(l -> monthlyBids.getOrDefault(l, 0L)).collect(Collectors.toList())
        ));
    }
}
