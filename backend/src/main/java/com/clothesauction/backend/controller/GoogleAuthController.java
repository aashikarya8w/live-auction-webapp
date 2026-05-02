package com.clothesauction.backend.controller;

import com.clothesauction.backend.config.JwtService;
import com.clothesauction.backend.model.Role;
import com.clothesauction.backend.model.User;
import com.clothesauction.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class GoogleAuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public GoogleAuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/google")
    public ResponseEntity<Map<String, String>> googleLogin(@RequestBody Map<String, String> body) {
        String googleToken = body.get("token");

        try {
            // Verify Google token
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + googleToken;
            String response = restTemplate.getForObject(url, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response);

            String email = node.get("email").asText();
            String name = node.has("name") ? node.get("name").asText() : email.split("@")[0];

            // Find or create user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setFullName(name);
                newUser.setPassword("GOOGLE_AUTH");
                newUser.setRole(Role.USER);
                return userRepository.save(newUser);
            });

            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(Map.of("token", token));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Google token"));
        }
    }
}
