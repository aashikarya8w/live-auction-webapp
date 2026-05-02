package com.clothesauction.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;

    private LocalDateTime bidTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "bids"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    public Bid() {}

    public Bid(Long id, Double amount, LocalDateTime bidTime, Product product, User user) {
        this.id = id;
        this.amount = amount;
        this.bidTime = bidTime;
        this.product = product;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Double amount;
        private LocalDateTime bidTime;
        private Product product;
        private User user;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder amount(Double amount) { this.amount = amount; return this; }
        public Builder bidTime(LocalDateTime bidTime) { this.bidTime = bidTime; return this; }
        public Builder product(Product product) { this.product = product; return this; }
        public Builder user(User user) { this.user = user; return this; }

        public Bid build() {
            return new Bid(id, amount, bidTime, product, user);
        }
    }
}
