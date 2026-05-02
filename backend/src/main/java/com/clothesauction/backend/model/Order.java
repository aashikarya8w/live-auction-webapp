package com.clothesauction.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalPrice;
    private LocalDateTime orderTime;
    private String trackingStatus; // PLACED, CONFIRMED, SHIPPED, DELIVERED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Product product;

    @PrePersist
    public void prePersist() { if (this.trackingStatus == null) this.trackingStatus = "PLACED"; }

    public Order() {}

    public Order(Long id, Double totalPrice, LocalDateTime orderTime, User user, Product product) {
        this.id = id;
        this.totalPrice = totalPrice;
        this.orderTime = orderTime;
        this.user = user;
        this.product = product;
        this.trackingStatus = "PLACED";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public LocalDateTime getOrderTime() { return orderTime; }
    public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
    public String getTrackingStatus() { return trackingStatus; }
    public void setTrackingStatus(String trackingStatus) { this.trackingStatus = trackingStatus; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Double totalPrice;
        private LocalDateTime orderTime;
        private User user;
        private Product product;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder totalPrice(Double totalPrice) { this.totalPrice = totalPrice; return this; }
        public Builder orderTime(LocalDateTime orderTime) { this.orderTime = orderTime; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder product(Product product) { this.product = product; return this; }

        public Order build() { return new Order(id, totalPrice, orderTime, user, product); }
    }
}
