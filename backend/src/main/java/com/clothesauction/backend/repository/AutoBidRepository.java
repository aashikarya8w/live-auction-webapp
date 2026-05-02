package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.AutoBid;
import com.clothesauction.backend.model.Product;
import com.clothesauction.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutoBidRepository extends JpaRepository<AutoBid, Long> {
    List<AutoBid> findByProductAndActiveTrue(Product product);
    Optional<AutoBid> findByProductAndUserAndActiveTrue(Product product, User user);
}
