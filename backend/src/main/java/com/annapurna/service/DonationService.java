package com.annapurna.service;

import com.annapurna.model.Donation;
import com.annapurna.model.User;
import com.annapurna.repository.DonationRepository;
import com.annapurna.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

/** DonationService — manages food donation CRUD and status updates */
@Service
public class DonationService {

    @Autowired private DonationRepository donationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MatchingService matchingService;
    @Autowired private NotificationService notificationService;

    public Donation createDonation(Long donorId, Donation donation) {
        User donor = userRepository.findById(donorId)
            .orElseThrow(() -> new RuntimeException("Donor not found"));
        donation.setDonor(donor);
        donation.setStatus(Donation.DonationStatus.AVAILABLE);
        donation.setCreatedAt(LocalDateTime.now());

        // Calculate initial priority score
        double score = matchingService.calculatePriorityScore(donation, 0, 0);
        donation.setPriorityScore(score);

        Donation saved = donationRepository.save(donation);

        // Notify volunteers about new donation
        notificationService.notifyAllVolunteers("🍱 New Donation Available!",
            donor.getName() + " donated " + donation.getFoodName() + " near your area.");

        return saved;
    }

    public List<Donation> getAllDonations() { return donationRepository.findAll(); }
    public List<Donation> getDonationsByDonor(Long donorId) { return donationRepository.findByDonorId(donorId); }
    public List<Donation> getAvailableDonations() { return donationRepository.findByStatus(Donation.DonationStatus.AVAILABLE); }

    public Donation updateDonationStatus(Long id, String status) {
        Donation d = donationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found: " + id));
        d.setStatus(Donation.DonationStatus.valueOf(status.toUpperCase()));
        return donationRepository.save(d);
    }

    public void deleteDonation(Long id) { donationRepository.deleteById(id); }

    /** Get analytics counts */
    public long countByStatus(String status) {
        return donationRepository.countByStatus(Donation.DonationStatus.valueOf(status.toUpperCase()));
    }
}
