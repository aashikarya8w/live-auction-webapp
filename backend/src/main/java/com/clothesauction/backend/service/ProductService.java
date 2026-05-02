package com.clothesauction.backend.service;

import com.clothesauction.backend.exception.ResourceNotFoundException;
import com.clothesauction.backend.model.*;
import com.clothesauction.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product addProduct(Product product) {
        product.setStatus(ProductStatus.AVAILABLE);
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Page<Product> getProductsPaginated(int page, int size, String category, String type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (category != null && !category.isEmpty() && !category.equals("ALL")) {
            try {
                Category cat = Category.valueOf(category.toUpperCase());
                if ("auction".equals(type)) return productRepository.findByCategoryAndIsAuctionTrue(cat, pageable);
                if ("buy".equals(type)) return productRepository.findByCategoryAndIsAuctionFalse(cat, pageable);
                return productRepository.findByCategory(cat, pageable);
            } catch (IllegalArgumentException e) {
                return productRepository.findAll(pageable);
            }
        }

        if ("auction".equals(type)) return productRepository.findByIsAuctionTrue(pageable);
        if ("buy".equals(type)) return productRepository.findByIsAuctionFalse(pageable);
        return productRepository.findAll(pageable);
    }

    public List<Product> getByCategory(Category category) {
        return productRepository.findByCategory(category);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found with id: " + id)
                );
    }

    public Product updateProduct(Long id, Product updated) {

        Product product = getProductById(id);

        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setCategory(updated.getCategory());
        product.setPrice(updated.getPrice());
        product.setIsAuction(updated.getIsAuction());
        product.setAuctionEndTime(updated.getAuctionEndTime());
        product.setImageUrl(updated.getImageUrl());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
