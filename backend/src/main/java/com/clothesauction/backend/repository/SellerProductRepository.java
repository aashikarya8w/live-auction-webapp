package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.SellerProduct;
import com.clothesauction.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SellerProductRepository extends JpaRepository<SellerProduct, Long> {
    List<SellerProduct> findBySeller(User seller);
    List<SellerProduct> findByStatus(String status);
}
