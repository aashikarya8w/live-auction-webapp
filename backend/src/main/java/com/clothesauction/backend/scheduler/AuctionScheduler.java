package com.clothesauction.backend.scheduler;

import com.clothesauction.backend.model.Product;
import com.clothesauction.backend.model.ProductStatus;
import com.clothesauction.backend.repository.ProductRepository;
import com.clothesauction.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionScheduler.class);

    private final ProductRepository productRepository;
    private final EmailService emailService;

    public AuctionScheduler(ProductRepository productRepository, EmailService emailService) {
        this.productRepository = productRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void closeExpiredAuctions() {

        log.info("Checking for expired auctions...");

        List<Product> expiredProducts =
                productRepository.findByIsAuctionTrueAndStatusAndAuctionEndTimeBefore(
                        ProductStatus.AVAILABLE,
                        LocalDateTime.now()
                );

        for (Product product : expiredProducts) {

            log.info("Closing auction for product ID: {}", product.getId());

            if (product.getHighestBidderId() != null) {
                // Check reserve price
                boolean reserveMet = product.getReservePrice() == null ||
                        (product.getCurrentHighestBid() != null &&
                         product.getCurrentHighestBid() >= product.getReservePrice());

                if (reserveMet) {
                    product.setStatus(ProductStatus.SOLD);
                    try {
                        emailService.sendAuctionWinnerEmail(product);
                        log.info("Winner email sent for product ID: {}", product.getId());
                    } catch (Exception e) {
                        log.error("Failed to send winner email for product ID: {}", product.getId(), e);
                    }
                } else {
                    log.info("Reserve price not met for product ID: {} (reserve: {}, highest: {})",
                            product.getId(), product.getReservePrice(), product.getCurrentHighestBid());
                    // Don't mark as sold — auction failed
                }

            } else {
                log.info("Auction ended without bids for product ID: {}", product.getId());
            }

            productRepository.save(product);
        }
    }
}
