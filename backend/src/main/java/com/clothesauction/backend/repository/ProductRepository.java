package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.Product;
import com.clothesauction.backend.model.ProductStatus;
import com.clothesauction.backend.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(Category category);
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByIsAuctionTrueAndStatusAndAuctionEndTimeBefore(ProductStatus status, LocalDateTime time);

    // Pessimistic lock for concurrent bid handling
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(Long id);

    // Paginated
    Page<Product> findAll(Pageable pageable);
    Page<Product> findByCategory(Category category, Pageable pageable);
    Page<Product> findByIsAuctionTrue(Pageable pageable);
    Page<Product> findByIsAuctionFalse(Pageable pageable);
    Page<Product> findByCategoryAndIsAuctionTrue(Category category, Pageable pageable);
    Page<Product> findByCategoryAndIsAuctionFalse(Category category, Pageable pageable);
}