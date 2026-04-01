package com.annapurna.controller;

import com.annapurna.model.Donation;
import com.annapurna.service.DonationService;
import com.annapurna.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * DonationController — REST endpoints for food donations
 * Base URL: /api/donations
 */
@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    @Autowired private DonationService donationService;
    @Autowired private MatchingService matchingService;

    /** POST /api/donations/donor/{donorId} — create donation */
    @PostMapping("/donor/{donorId}")
    public ResponseEntity<Donation> createDonation(
            @PathVariable Long donorId,
            @RequestBody Donation donation) {
        return ResponseEntity.ok(donationService.createDonation(donorId, donation));
    }

    /** GET /api/donations — all donations */
    @GetMapping
    public ResponseEntity<List<Donation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    /** GET /api/donations/available — only available ones */
    @GetMapping("/available")
    public ResponseEntity<List<Donation>> getAvailableDonations() {
        return ResponseEntity.ok(donationService.getAvailableDonations());
    }

    /** GET /api/donations/donor/{donorId} — donations by donor */
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<Donation>> getByDonor(@PathVariable Long donorId) {
        return ResponseEntity.ok(donationService.getDonationsByDonor(donorId));
    }

    /** PATCH /api/donations/{id}/status?status=DELIVERED */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Donation> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(donationService.updateDonationStatus(id, status));
    }

    /** DELETE /api/donations/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.noContent().build();
    }

    /** POST /api/donations/recalculate-scores — refresh AI scores */
    @PostMapping("/recalculate-scores")
    public ResponseEntity<String> recalculateScores() {
        matchingService.updateAllPriorityScores();
        return ResponseEntity.ok("Priority scores updated successfully");
    }
}
