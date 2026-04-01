package com.annapurna.service;

import com.annapurna.model.Donation;
import com.annapurna.model.FoodRequest;
import com.annapurna.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    @Autowired
    private DonationRepository donationRepository;

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    public double calculatePriorityScore(Donation donation, double reqLat, double reqLon) {
        if (donation.getExpiryTime() == null) return 0.1;
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), donation.getExpiryTime());
        if (hours <= 0) return 0;
        double distance = 0.1;
        if (donation.getLatitude() != null && donation.getLongitude() != null) {
            distance = calculateDistance(donation.getLatitude(), donation.getLongitude(), reqLat, reqLon);
            if (distance == 0) distance = 0.01;
        }
        return Math.round(((1.0/distance) + (1.0/hours)) * 100.0) / 100.0;
    }

    public List<Map<String, Object>> findBestMatches(FoodRequest request, int maxResults) {
        List<Donation> available = donationRepository.findByStatus(Donation.DonationStatus.AVAILABLE);
        List<Map<String, Object>> scored = new ArrayList<>();
        for (Donation donation : available) {
            double reqLat = request.getLatitude() != null ? request.getLatitude() : 0;
            double reqLon = request.getLongitude() != null ? request.getLongitude() : 0;
            double score = calculatePriorityScore(donation, reqLat, reqLon);
            if (score > 0) {
                double distance = donation.getLatitude() != null
                    ? calculateDistance(donation.getLatitude(), donation.getLongitude(), reqLat, reqLon) : 999;
                Map<String, Object> match = new HashMap<>();
                match.put("donation", donation);
                match.put("priorityScore", score);
                match.put("distanceKm", Math.round(distance * 10.0) / 10.0);
                if (donation.getExpiryTime() != null)
                    match.put("hoursUntilExpiry", ChronoUnit.HOURS.between(LocalDateTime.now(), donation.getExpiryTime()));
                scored.add(match);
            }
        }
        scored.sort((a, b) -> Double.compare((Double)b.get("priorityScore"), (Double)a.get("priorityScore")));
        return scored.stream().limit(maxResults).collect(Collectors.toList());
    }

    public void updateAllPriorityScores() {
        List<Donation> available = donationRepository.findByStatus(Donation.DonationStatus.AVAILABLE);
        for (Donation d : available) { d.setPriorityScore(calculatePriorityScore(d, 0, 0)); donationRepository.save(d); }
    }
}