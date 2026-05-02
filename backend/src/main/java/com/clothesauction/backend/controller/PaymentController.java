package com.clothesauction.backend.controller;

import com.clothesauction.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(
            @RequestBody Map<String, Double> body) throws StripeException {

        Double amount = body.get("amount");
        Map<String, String> response = paymentService.createPaymentIntent(amount);
        return ResponseEntity.ok(response);
    }
}
