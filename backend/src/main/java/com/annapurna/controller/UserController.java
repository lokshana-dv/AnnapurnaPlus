package com.annapurna.controller;

import com.annapurna.model.User;
import com.annapurna.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * UserController — REST endpoints for user management
 * Base URL: /api/users
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserService userService;

    /** POST /api/users/register — called after Firebase signup */
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody Map<String, String> body) {
        User user = userService.registerOrUpdateUser(
            body.get("firebaseUid"),
            body.get("name"),
            body.get("email"),
            body.get("role")
        );
        return ResponseEntity.ok(user);
    }

    /** GET /api/users — get all users (admin) */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** GET /api/users/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/users/firebase/{uid} — get by Firebase UID */
    @GetMapping("/firebase/{uid}")
    public ResponseEntity<User> getUserByFirebaseUid(@PathVariable String uid) {
        return userService.getUserByFirebaseUid(uid)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/users/role/{role} */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    /** PUT /api/users/{id} — update profile */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(id, user));
    }

    /** DELETE /api/users/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/users/leaderboard — volunteer leaderboard */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(userService.getVolunteerLeaderboard());
    }

    /** POST /api/users/{id}/badge — award badge */
    @PostMapping("/{id}/badge")
    public ResponseEntity<User> awardBadge(@PathVariable Long id) {
        return ResponseEntity.ok(userService.awardBadge(id));
    }
}
