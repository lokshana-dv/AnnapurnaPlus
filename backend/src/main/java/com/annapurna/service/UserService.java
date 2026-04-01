package com.annapurna.service;

import com.annapurna.model.User;
import com.annapurna.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/** UserService — handles all user-related business logic */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /** Register or sync user after Firebase login */
    public User registerOrUpdateUser(String firebaseUid, String name, String email, String role) {
        Optional<User> existing = userRepository.findByFirebaseUid(firebaseUid);
        if (existing.isPresent()) {
            User user = existing.get();
            user.setName(name);
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        User user = new User();
        user.setFirebaseUid(firebaseUid);
        user.setName(name);
        user.setEmail(email);
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) { return userRepository.findById(id); }
    public Optional<User> getUserByFirebaseUid(String uid) { return userRepository.findByFirebaseUid(uid); }
    public List<User> getAllUsers() { return userRepository.findAll(); }
    public List<User> getUsersByRole(String role) { return userRepository.findByRole(User.Role.valueOf(role.toUpperCase())); }

    public User updateProfile(Long id, User updatedData) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found: " + id));
        if (updatedData.getName() != null) user.setName(updatedData.getName());
        if (updatedData.getPhone() != null) user.setPhone(updatedData.getPhone());
        if (updatedData.getAddress() != null) user.setAddress(updatedData.getAddress());
        if (updatedData.getLatitude() != null) user.setLatitude(updatedData.getLatitude());
        if (updatedData.getLongitude() != null) user.setLongitude(updatedData.getLongitude());
        if (updatedData.getProfileImage() != null) user.setProfileImage(updatedData.getProfileImage());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) { userRepository.deleteById(id); }

    public User awardBadge(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setBadgeCount(user.getBadgeCount() + 1);
        return userRepository.save(user);
    }

    public List<User> getVolunteerLeaderboard() {
        return userRepository.findByRole(User.Role.VOLUNTEER).stream()
            .sorted((a, b) -> Integer.compare(b.getBadgeCount(), a.getBadgeCount()))
            .limit(10).toList();
    }
}
