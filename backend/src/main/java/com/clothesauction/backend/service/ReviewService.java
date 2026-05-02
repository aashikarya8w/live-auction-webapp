package com.clothesauction.backend.service;

import com.clothesauction.backend.exception.BadRequestException;
import com.clothesauction.backend.exception.ResourceNotFoundException;
import com.clothesauction.backend.model.*;
import com.clothesauction.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Review addReview(Long productId, Long userId, int rating, String comment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // One review per user per product
        reviewRepository.findByProductAndUser(product, user).ifPresent(r -> {
            throw new BadRequestException("You have already reviewed this product");
        });

        if (rating < 1 || rating > 5) throw new BadRequestException("Rating must be between 1 and 5");

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return reviewRepository.findByProduct(product);
    }

    public Map<String, Object> getProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        Double avg = reviewRepository.findAverageRatingByProduct(product);
        long count = reviewRepository.findByProduct(product).size();
        return Map.of("average", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0, "count", count);
    }
}
