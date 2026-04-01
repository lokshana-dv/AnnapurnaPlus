package com.annapurna.controller;

import com.annapurna.model.*;
import com.annapurna.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

/**
 * AdminController — analytics & admin dashboard endpoints
 * Base URL: /api/admin
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private DonationRepository donationRepository;
    @Autowired private DeliveryRepository deliveryRepository;
    @Autowired private FoodRequestRepository requestRepository;

    /** GET /api/admin/stats — dashboard analytics */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User counts
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDonors", userRepository.findByRole(User.Role.DONOR).size());
        stats.put("totalVolunteers", userRepository.findByRole(User.Role.VOLUNTEER).size());
        stats.put("totalNGOs", userRepository.findByRole(User.Role.NGO).size());

        // Donation stats
        stats.put("totalDonations", donationRepository.count());
        stats.put("availableDonations", donationRepository.countByStatus(Donation.DonationStatus.AVAILABLE));
        stats.put("deliveredDonations", donationRepository.countByStatus(Donation.DonationStatus.DELIVERED));

        // Delivery stats
        stats.put("totalDeliveries", deliveryRepository.count());
        stats.put("activeDeliveries", deliveryRepository.countByStatus(Delivery.DeliveryStatus.ACCEPTED)
            + deliveryRepository.countByStatus(Delivery.DeliveryStatus.PICKUP_IN_PROGRESS));
        stats.put("completedDeliveries", deliveryRepository.countByStatus(Delivery.DeliveryStatus.DELIVERED));

        // Impact metrics
        long mealsServed = deliveryRepository.countByStatus(Delivery.DeliveryStatus.DELIVERED) * 4; // avg 4 meals per delivery
        stats.put("estimatedMealsServed", mealsServed);
        stats.put("wasteReducedKg", mealsServed * 0.5); // rough estimate

        // Requests
        stats.put("pendingRequests", requestRepository.countByStatus(FoodRequest.RequestStatus.PENDING));
        stats.put("fulfilledRequests", requestRepository.countByStatus(FoodRequest.RequestStatus.FULFILLED));

        return ResponseEntity.ok(stats);
    }
}
