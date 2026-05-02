package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.Bid;
import com.clothesauction.backend.model.Product;
import com.clothesauction.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {

    // Product ke saare bids
    List<Bid> findByProduct(Product product);

    // User ke saare bids
    List<Bid> findByUser(User user);

    // Highest bid find karne ke liye
    Optional<Bid> findTopByProductOrderByAmountDesc(Product product);
}