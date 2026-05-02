package com.clothesauction.backend.service;

import com.clothesauction.backend.model.Product;
import com.clothesauction.backend.model.User;
import com.clothesauction.backend.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    public EmailService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    public void sendAuctionWinnerEmail(Product product) {

        if (product.getHighestBidderId() == null) {
            return;
        }

        User winner = userRepository.findById(product.getHighestBidderId())
                .orElseThrow(() -> new RuntimeException("Winner not found"));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(winner.getEmail());
        message.setSubject("Congratulations! You won the auction");
        message.setText(
                "Hello " + winner.getFullName() + ",\n\n" +
                        "You have won the auction for product: " + product.getName() + "\n" +
                        "Winning Amount: Rs." + product.getCurrentHighestBid() + "\n\n" +
                        "Please complete your purchase.\n\n" +
                        "Thank you!"
        );

        mailSender.send(message);
    }
}
