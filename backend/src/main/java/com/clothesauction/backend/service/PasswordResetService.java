package com.clothesauction.backend.service;

import com.clothesauction.backend.exception.BadRequestException;
import com.clothesauction.backend.exception.ResourceNotFoundException;
import com.clothesauction.backend.model.PasswordResetToken;
import com.clothesauction.backend.model.User;
import com.clothesauction.backend.repository.PasswordResetTokenRepository;
import com.clothesauction.backend.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepository userRepository,
                                 PasswordResetTokenRepository tokenRepository,
                                 JavaMailSender mailSender,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    public void sendResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + email));

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        tokenRepository.save(resetToken);

        // Send email
        String resetLink = "http://172.22.77.146:5173/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("BidNexus — Reset Your Password");
        message.setText(
            "Hello " + user.getFullName() + ",\n\n" +
            "You requested to reset your password.\n\n" +
            "Click the link below to reset your password (valid for 30 minutes):\n\n" +
            resetLink + "\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Team BidNexus"
        );

        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (resetToken.isUsed())
            throw new BadRequestException("This reset link has already been used");

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new BadRequestException("Reset link has expired. Please request a new one");

        if (newPassword == null || newPassword.trim().isEmpty())
            throw new BadRequestException("Password cannot be empty");

        if (newPassword.length() < 6)
            throw new BadRequestException("Password must be at least 6 characters");

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
