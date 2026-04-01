package com.annapurna.service;

import com.annapurna.model.User;
import com.annapurna.model.Donation;
import com.annapurna.model.Delivery;
import com.annapurna.repository.UserRepository;
import com.annapurna.repository.DonationRepository;
import com.annapurna.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalDonors", userRepository.findByRole(User.Role.DONOR).size());
        stats.put("totalVolunteers", userRepository.findByRole(User.Role.VOLUNTEER).size());
        stats.put("totalNGOs", userRepository.findByRole(User.Role.NGO).size());
        stats.put("totalDonations", donationRepository.count());
        stats.put("availableDonations", donationRepository.countByStatus(Donation.DonationStatus.AVAILABLE));
        stats.put("deliveredDonations", donationRepository.countByStatus(Donation.DonationStatus.DELIVERED));
        stats.put("completedDeliveries", deliveryRepository.countByStatus(Delivery.DeliveryStatus.DELIVERED));

        long mealsServed = deliveryRepository.countByStatus(Delivery.DeliveryStatus.DELIVERED) * 4;
        stats.put("estimatedMealsServed", mealsServed);
        stats.put("wasteReducedKg", mealsServed * 0.5);

        return stats;
    }

    public List<User> getVolunteerLeaderboard() {
        return userRepository.findByRole(User.Role.VOLUNTEER)
            .stream()
            .sorted((a, b) -> Integer.compare(
                b.getBadgeCount() != null ? b.getBadgeCount() : 0,
                a.getBadgeCount() != null ? a.getBadgeCount() : 0))
            .limit(10)
            .toList();
    }
}