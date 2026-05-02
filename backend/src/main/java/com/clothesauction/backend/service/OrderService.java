package com.clothesauction.backend.service;

import com.clothesauction.backend.exception.InvalidBidException;
import com.clothesauction.backend.exception.ResourceNotFoundException;
import com.clothesauction.backend.model.*;
import com.clothesauction.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(Long userId, Long productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + userId)
                );

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found with id: " + productId)
                );

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new InvalidBidException("Product already sold");
        }

        Double finalPrice;

        if (Boolean.TRUE.equals(product.getIsAuction())) {

            if (product.getHighestBidderId() == null) {
                throw new InvalidBidException("Auction ended without any bids");
            }

            if (!product.getHighestBidderId().equals(user.getId())) {
                throw new InvalidBidException("Only highest bidder can purchase this auction product");
            }

            finalPrice = product.getCurrentHighestBid();

        } else {
            finalPrice = product.getPrice();
        }

        product.setStatus(ProductStatus.SOLD);

        Order order = Order.builder()
                .user(user)
                .product(product)
                .totalPrice(finalPrice)
                .orderTime(LocalDateTime.now())
                .build();

        productRepository.save(product);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + userId)
                );

        return orderRepository.findByUser(user);
    }

    public Order updateTracking(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setTrackingStatus(status);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
