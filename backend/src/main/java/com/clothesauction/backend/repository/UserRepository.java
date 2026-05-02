package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Login ke liye useful
    Optional<User> findByEmail(String email);

    // Check email already exists
    boolean existsByEmail(String email);
}