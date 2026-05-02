package com.clothesauction.backend.controller;

import com.clothesauction.backend.dto.BidRequest;
import com.clothesauction.backend.model.AutoBid;
import com.clothesauction.backend.model.Bid;
import com.clothesauction.backend.service.BidService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping
    public Bid placeBid(@RequestBody @Valid BidRequest request) {
        return bidService.placeBid(request);
    }

    @GetMapping("/product/{productId}")
    public List<Bid> getBidsByProduct(@PathVariable Long productId) {
        return bidService.getBidsByProduct(productId);
    }

    @GetMapping("/user/{userId}")
    public List<Bid> getBidsByUser(@PathVariable Long userId) {
        return bidService.getBidsByUser(userId);
    }

    // Auto Bid
    @PostMapping("/auto")
    public ResponseEntity<AutoBid> setAutoBid(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long productId = Long.valueOf(body.get("productId").toString());
        Double maxAmount = Double.valueOf(body.get("maxAmount").toString());
        Double increment = body.containsKey("increment") ? Double.valueOf(body.get("increment").toString()) : 100.0;
        return ResponseEntity.ok(bidService.setAutoBid(userId, productId, maxAmount, increment));
    }
}
