package com.clothesauction.backend.controller;

import com.clothesauction.backend.dto.OrderRequest;
import com.clothesauction.backend.model.Order;
import com.clothesauction.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order createOrder(@RequestBody @Valid OrderRequest request) {
        return orderService.createOrder(
                request.getUserId(),
                request.getProductId()
        );
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId);
    }

    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{orderId}/tracking")
    public ResponseEntity<Order> updateTracking(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateTracking(orderId, body.get("status")));
    }
}
