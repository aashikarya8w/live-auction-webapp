package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.Order;
import com.clothesauction.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // User ke orders
    List<Order> findByUser(User user);
}