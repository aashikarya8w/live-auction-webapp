package com.clothesauction.backend.service;

import com.clothesauction.backend.exception.BadRequestException;
import com.clothesauction.backend.model.Coupon;
import com.clothesauction.backend.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public Map<String, Object> validateCoupon(String code, Double cartTotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.isActive()) throw new BadRequestException("Coupon is no longer active");
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new BadRequestException("Coupon has expired");
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit())
            throw new BadRequestException("Coupon usage limit reached");

        double discount = cartTotal * (coupon.getDiscountPercent() / 100.0);
        if (coupon.getMaxDiscount() != null) discount = Math.min(discount, coupon.getMaxDiscount());
        double finalAmount = cartTotal - discount;

        return Map.of(
                "valid", true,
                "discount", Math.round(discount * 100.0) / 100.0,
                "finalAmount", Math.round(finalAmount * 100.0) / 100.0,
                "discountPercent", coupon.getDiscountPercent(),
                "code", coupon.getCode()
        );
    }

    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
