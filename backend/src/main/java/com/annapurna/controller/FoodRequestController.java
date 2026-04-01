package com.annapurna.controller;

import com.annapurna.model.FoodRequest;
import com.annapurna.service.FoodRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/** FoodRequestController — Base URL: /api/requests */
@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class FoodRequestController {

    @Autowired private FoodRequestService requestService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<FoodRequest> createRequest(@PathVariable Long userId, @RequestBody FoodRequest request) {
        return ResponseEntity.ok(requestService.createRequest(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<FoodRequest>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FoodRequest>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getRequestsByUser(userId));
    }

    /** GET /api/requests/{id}/matches — AI matching results */
    @GetMapping("/{id}/matches")
    public ResponseEntity<List<Map<String, Object>>> getMatches(@PathVariable Long id) {
        return ResponseEntity.ok(requestService.getMatchedDonations(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<FoodRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(requestService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
