package com.annapurna.service;

import com.annapurna.model.Notification;
import com.annapurna.model.User;
import com.annapurna.repository.NotificationRepository;
import com.annapurna.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

/** NotificationService — creates and manages in-app notifications */
@Service
public class NotificationService {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;

    public Notification sendNotification(Long userId, String title, String message, Notification.NotificationType type) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(n);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsRead(userId, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    /** Notify all volunteers — used when a new donation is posted */
    public void notifyAllVolunteers(String title, String message) {
        List<User> volunteers = userRepository.findByRole(User.Role.VOLUNTEER);
        for (User v : volunteers) {
            sendNotification(v.getId(), title, message, Notification.NotificationType.NEW_DONATION);
        }
    }
}
