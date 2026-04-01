package com.annapurna.repository;

import com.annapurna.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Get all notifications for a user (newest first)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Get unread count for badge display
    long countByUserIdAndIsRead(Long userId, Boolean isRead);

    // Mark all as read
    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);
}
