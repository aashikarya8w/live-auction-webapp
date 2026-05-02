package com.clothesauction.backend.service;

import com.clothesauction.backend.dto.BidRequest;
import com.clothesauction.backend.exception.InvalidBidException;
import com.clothesauction.backend.exception.ResourceNotFoundException;
import com.clothesauction.backend.model.*;
import com.clothesauction.backend.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final AutoBidRepository autoBidRepository;

    public BidService(BidRepository bidRepository, ProductRepository productRepository,
                      UserRepository userRepository, NotificationService notificationService,
                      SimpMessagingTemplate messagingTemplate, AutoBidRepository autoBidRepository) {
        this.bidRepository = bidRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
        this.autoBidRepository = autoBidRepository;
    }

    @Transactional
    public Bid placeBid(BidRequest request) {
        Product product = productRepository.findByIdWithLock(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateBid(product, user, request.getAmount());

        // ── ANTI-SNIPING ──
        if (Boolean.TRUE.equals(product.getAntiSnipingEnabled()) && product.getAuctionEndTime() != null) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), product.getAuctionEndTime()).toMinutes();
            if (minutesLeft <= 2) {
                int ext = product.getExtensionMinutes() != null ? product.getExtensionMinutes() : 2;
                product.setAuctionEndTime(product.getAuctionEndTime().plusMinutes(ext));
                broadcastMessage(product.getId(), "ANTI_SNIPE", "Auction extended by " + ext + " minutes!");
            }
        }

        // Notify previous highest bidder
        if (product.getHighestBidderId() != null && !product.getHighestBidderId().equals(user.getId())) {
            userRepository.findById(product.getHighestBidderId()).ifPresent(prev ->
                notificationService.createNotification(prev,
                    "You've been outbid on \"" + product.getName() + "\"! New bid: ₹" + request.getAmount(),
                    "BID_OUTBID")
            );
        }

        product.setCurrentHighestBid(request.getAmount());
        product.setHighestBidderId(user.getId());

        Bid bid = Bid.builder()
                .amount(request.getAmount())
                .product(product)
                .user(user)
                .bidTime(LocalDateTime.now())
                .build();

        productRepository.save(product);
        Bid savedBid = bidRepository.save(bid);

        // Broadcast real-time update
        Map<String, Object> update = new HashMap<>();
        update.put("productId", product.getId());
        update.put("productName", product.getName());
        update.put("amount", request.getAmount());
        update.put("bidderName", user.getFullName() != null ? user.getFullName() : user.getEmail());
        update.put("bidTime", LocalDateTime.now().toString());
        update.put("auctionEndTime", product.getAuctionEndTime() != null ? product.getAuctionEndTime().toString() : null);
        update.put("totalBids", bidRepository.findByProduct(product).size());
        messagingTemplate.convertAndSend("/topic/bids/" + product.getId(), update);
        messagingTemplate.convertAndSend("/topic/bids", update);

        // ── AUTO-BID: trigger other users' auto bids ──
        triggerAutoBids(product, user, request.getAmount());

        return savedBid;
    }

    private void validateBid(Product product, User user, Double amount) {
        if (!Boolean.TRUE.equals(product.getIsAuction()))
            throw new InvalidBidException("This product is not available for auction");
        if (product.getStatus() == ProductStatus.SOLD)
            throw new InvalidBidException("Product already sold");
        if (product.getAuctionEndTime() != null && product.getAuctionEndTime().isBefore(LocalDateTime.now()))
            throw new InvalidBidException("Auction has already ended");

        Double currentHighest = product.getCurrentHighestBid() != null
                ? product.getCurrentHighestBid() : product.getPrice();
        if (amount <= currentHighest)
            throw new InvalidBidException("Bid must be higher than current highest bid (" + currentHighest + ")");
    }

    @Transactional
    private void triggerAutoBids(Product product, User manualBidder, Double newAmount) {
        List<AutoBid> autoBids = autoBidRepository.findByProductAndActiveTrue(product);
        autoBids.sort(Comparator.comparingDouble(AutoBid::getMaxAmount).reversed());

        for (AutoBid autoBid : autoBids) {
            if (autoBid.getUser().getId().equals(manualBidder.getId())) continue;
            if (!autoBid.isActive()) continue;

            Double increment = autoBid.getIncrement() != null ? autoBid.getIncrement() : 100.0;
            Double nextBid = newAmount + increment;

            if (nextBid <= autoBid.getMaxAmount()) {
                product.setCurrentHighestBid(nextBid);
                product.setHighestBidderId(autoBid.getUser().getId());

                Bid autoBidRecord = Bid.builder()
                        .amount(nextBid)
                        .product(product)
                        .user(autoBid.getUser())
                        .bidTime(LocalDateTime.now())
                        .build();
                bidRepository.save(autoBidRecord);
                productRepository.save(product);

                // Notify manual bidder they were outbid by auto-bid
                notificationService.createNotification(manualBidder,
                    "Auto-bid placed ₹" + nextBid + " on \"" + product.getName() + "\"",
                    "BID_OUTBID");

                Map<String, Object> update = new HashMap<>();
                update.put("productId", product.getId());
                update.put("amount", nextBid);
                update.put("bidderName", autoBid.getUser().getFullName() + " (Auto)");
                update.put("bidTime", LocalDateTime.now().toString());
                messagingTemplate.convertAndSend("/topic/bids/" + product.getId(), update);
                messagingTemplate.convertAndSend("/topic/bids", update);

                newAmount = nextBid;
                break;
            } else {
                autoBid.setActive(false);
                autoBidRepository.save(autoBid);
            }
        }
    }

    private void broadcastMessage(Long productId, String type, String message) {
        Map<String, Object> msg = new HashMap<>();
        msg.put("productId", productId);
        msg.put("type", type);
        msg.put("message", message);
        messagingTemplate.convertAndSend("/topic/bids/" + productId, msg);
    }

    // ── SET AUTO BID ──
    @Transactional
    public AutoBid setAutoBid(Long userId, Long productId, Double maxAmount, Double increment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getIsAuction()))
            throw new InvalidBidException("Auto-bid only works for auctions");

        Double currentHighest = product.getCurrentHighestBid() != null
                ? product.getCurrentHighestBid() : product.getPrice();
        if (maxAmount <= currentHighest)
            throw new InvalidBidException("Max amount must be higher than current bid (" + currentHighest + ")");

        // Deactivate existing auto-bid
        autoBidRepository.findByProductAndUserAndActiveTrue(product, user)
                .ifPresent(ab -> { ab.setActive(false); autoBidRepository.save(ab); });

        AutoBid autoBid = new AutoBid();
        autoBid.setUser(user);
        autoBid.setProduct(product);
        autoBid.setMaxAmount(maxAmount);
        autoBid.setIncrement(increment != null ? increment : 100.0);
        return autoBidRepository.save(autoBid);
    }

    public List<Bid> getBidsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return bidRepository.findByProduct(product);
    }

    public List<Bid> getBidsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return bidRepository.findByUser(user);
    }
}
