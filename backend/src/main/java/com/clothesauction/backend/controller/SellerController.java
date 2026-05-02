package com.clothesauction.backend.controller;

import com.clothesauction.backend.model.SellerProduct;
import com.clothesauction.backend.service.SellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/seller")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @PostMapping("/submit/{userId}")
    public ResponseEntity<SellerProduct> submit(@PathVariable Long userId, @RequestBody SellerProduct sp) {
        return ResponseEntity.ok(sellerService.submitProduct(userId, sp));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<SellerProduct>> myProducts(@PathVariable Long userId) {
        return ResponseEntity.ok(sellerService.getMyProducts(userId));
    }

    @GetMapping("/admin/pending")
    public ResponseEntity<List<SellerProduct>> pending() {
        return ResponseEntity.ok(sellerService.getPendingProducts());
    }

    @PutMapping("/admin/approve/{id}")
    public ResponseEntity<SellerProduct> approve(@PathVariable Long id) {
        return ResponseEntity.ok(sellerService.approveProduct(id));
    }

    @PutMapping("/admin/reject/{id}")
    public ResponseEntity<SellerProduct> reject(@PathVariable Long id) {
        return ResponseEntity.ok(sellerService.rejectProduct(id));
    }
}
