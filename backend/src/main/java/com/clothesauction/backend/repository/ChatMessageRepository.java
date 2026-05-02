package com.clothesauction.backend.repository;

import com.clothesauction.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdAndTypeOrderBySentAtAsc(Long roomId, String type);
    List<ChatMessage> findTop50ByRoomIdAndTypeOrderBySentAtDesc(Long roomId, String type);
}
