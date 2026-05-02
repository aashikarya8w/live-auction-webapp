package com.clothesauction.backend.controller;

import com.clothesauction.backend.model.ChatMessage;
import com.clothesauction.backend.model.User;
import com.clothesauction.backend.repository.ChatMessageRepository;
import com.clothesauction.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // REST: Get chat history for auction room
    @GetMapping("/auction/{productId}")
    public ResponseEntity<List<ChatMessage>> getAuctionChat(@PathVariable Long productId) {
        List<ChatMessage> messages = chatMessageRepository
                .findTop50ByRoomIdAndTypeOrderBySentAtDesc(productId, "AUCTION_ROOM");
        Collections.reverse(messages);
        return ResponseEntity.ok(messages);
    }

    // REST: Send message to auction room
    @PostMapping("/auction/{productId}")
    public ResponseEntity<ChatMessage> sendAuctionMessage(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body) {

        Long userId = Long.valueOf(body.get("userId").toString());
        String message = body.get("message").toString().trim();

        if (message.isEmpty()) return ResponseEntity.badRequest().build();

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMessage(message);
        chatMessage.setType("AUCTION_ROOM");
        chatMessage.setRoomId(productId);
        chatMessage.setSender(sender);
        chatMessageRepository.save(chatMessage);

        // Broadcast via WebSocket
        Map<String, Object> wsMsg = Map.of(
                "id", chatMessage.getId(),
                "message", message,
                "senderName", sender.getFullName() != null ? sender.getFullName() : sender.getEmail(),
                "senderId", userId,
                "sentAt", LocalDateTime.now().toString(),
                "type", "CHAT"
        );
        messagingTemplate.convertAndSend("/topic/chat/" + productId, wsMsg);

        return ResponseEntity.ok(chatMessage);
    }

    // REST: Get direct chat history between two users
    @GetMapping("/direct/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessage>> getDirectChat(
            @PathVariable Long userId1, @PathVariable Long userId2) {
        Long roomId = Math.min(userId1, userId2) * 100000L + Math.max(userId1, userId2);
        List<ChatMessage> messages = chatMessageRepository
                .findTop50ByRoomIdAndTypeOrderBySentAtDesc(roomId, "DIRECT");
        Collections.reverse(messages);
        return ResponseEntity.ok(messages);
    }

    // REST: Send direct message
    @PostMapping("/direct/{userId1}/{userId2}")
    public ResponseEntity<ChatMessage> sendDirectMessage(
            @PathVariable Long userId1, @PathVariable Long userId2,
            @RequestBody Map<String, Object> body) {

        Long senderId = Long.valueOf(body.get("senderId").toString());
        String message = body.get("message").toString().trim();
        if (message.isEmpty()) return ResponseEntity.badRequest().build();

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long roomId = Math.min(userId1, userId2) * 100000L + Math.max(userId1, userId2);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMessage(message);
        chatMessage.setType("DIRECT");
        chatMessage.setRoomId(roomId);
        chatMessage.setSender(sender);
        chatMessageRepository.save(chatMessage);

        Map<String, Object> wsMsg = Map.of(
                "id", chatMessage.getId(),
                "message", message,
                "senderName", sender.getFullName() != null ? sender.getFullName() : sender.getEmail(),
                "senderId", senderId,
                "sentAt", LocalDateTime.now().toString(),
                "type", "DIRECT"
        );
        messagingTemplate.convertAndSend("/topic/chat/direct/" + roomId, wsMsg);

        return ResponseEntity.ok(chatMessage);
    }
}
