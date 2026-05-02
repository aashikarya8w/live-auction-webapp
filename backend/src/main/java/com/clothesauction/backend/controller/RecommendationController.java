package com.clothesauction.backend.controller;

import com.clothesauction.backend.model.Product;
import com.clothesauction.backend.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    // Personalized recommendations for user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Product>> getForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, limit));
    }

    // Guest recommendations (no user)
    @GetMapping("/guest")
    public ResponseEntity<List<Product>> getForGuest(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendations(null, limit));
    }

    // Similar products for a product page
    @GetMapping("/similar/{productId}")
    public ResponseEntity<List<Product>> getSimilar(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(recommendationService.getSimilarProducts(productId, limit));
    }
}
