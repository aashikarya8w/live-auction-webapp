package com.clothesauction.backend.service;

import com.clothesauction.backend.exception.ResourceNotFoundException;
import com.clothesauction.backend.model.*;
import com.clothesauction.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SellerService {

    private final SellerProductRepository sellerProductRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public SellerService(SellerProductRepository sellerProductRepository,
                         UserRepository userRepository,
                         ProductRepository productRepository) {
        this.sellerProductRepository = sellerProductRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public SellerProduct submitProduct(Long userId, SellerProduct sp) {
        User seller = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        sp.setSeller(seller);
        return sellerProductRepository.save(sp);
    }

    public List<SellerProduct> getMyProducts(Long userId) {
        User seller = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return sellerProductRepository.findBySeller(seller);
    }

    public List<SellerProduct> getPendingProducts() {
        return sellerProductRepository.findByStatus("PENDING");
    }

    public SellerProduct approveProduct(Long id) {
        SellerProduct sp = sellerProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seller product not found"));
        sp.setStatus("APPROVED");
        sellerProductRepository.save(sp);

        // Add to main products
        Product product = new Product();
        product.setName(sp.getName());
        product.setDescription(sp.getDescription());
        product.setCategory(sp.getCategory());
        product.setPrice(sp.getPrice());
        product.setIsAuction(sp.getIsAuction());
        product.setAuctionEndTime(sp.getAuctionEndTime());
        product.setImageUrl(sp.getImageUrl());
        productRepository.save(product);

        return sp;
    }

    public SellerProduct rejectProduct(Long id) {
        SellerProduct sp = sellerProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seller product not found"));
        sp.setStatus("REJECTED");
        return sellerProductRepository.save(sp);
    }
}
