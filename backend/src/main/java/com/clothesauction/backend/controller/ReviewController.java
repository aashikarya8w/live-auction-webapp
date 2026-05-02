package com.clothesauction.backend.controller;

import com.clothesauction.backend.model.Review;
import com.clothesauction.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Long userId = Long.valueOf(body.get("userId").toString());
        int rating = Integer.parseInt(body.get("rating").toString());
        String comment = body.getOrDefault("comment", "").toString();
        return ResponseEntity.ok(reviewService.addReview(productId, userId, rating, comment));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Map<String, Object>> getProductRating(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductRating(productId));
    }
}
