package com.annapurna.service;

import com.annapurna.model.*;
import com.annapurna.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

/** DeliveryService — tracks food from donation to delivery */
@Service
public class DeliveryService {

    @Autowired private DeliveryRepository deliveryRepository;
    @Autowired private DonationRepository donationRepository;
    @Autowired private FoodRequestRepository requestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    /** Volunteer accepts a delivery request */
    public Delivery acceptDelivery(Long donationId, Long requestId, Long volunteerId) {
        Donation donation = donationRepository.findById(donationId)
            .orElseThrow(() -> new RuntimeException("Donation not found"));
        FoodRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        User volunteer = userRepository.findById(volunteerId)
            .orElseThrow(() -> new RuntimeException("Volunteer not found"));

        // Update donation status
        donation.setStatus(Donation.DonationStatus.MATCHED);
        donationRepository.save(donation);

        // Create delivery record
        Delivery delivery = new Delivery();
        delivery.setDonation(donation);
        delivery.setRequest(request);
        delivery.setVolunteer(volunteer);
        delivery.setStatus(Delivery.DeliveryStatus.ACCEPTED);
        delivery.setAcceptedAt(LocalDateTime.now());
        delivery.setCreatedAt(LocalDateTime.now());

        Delivery saved = deliveryRepository.save(delivery);

        // Notify donor that volunteer accepted
        notificationService.sendNotification(donation.getDonor().getId(),
            "🚴 Volunteer Assigned!", volunteer.getName() + " is picking up your donation.",
            Notification.NotificationType.VOLUNTEER_ASSIGNED);

        return saved;
    }

    /** Update delivery to next stage */
    public Delivery updateStatus(Long deliveryId, String status) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new RuntimeException("Delivery not found"));

        Delivery.DeliveryStatus newStatus = Delivery.DeliveryStatus.valueOf(status.toUpperCase());
        delivery.setStatus(newStatus);

        if (newStatus == Delivery.DeliveryStatus.PICKUP_IN_PROGRESS) {
            delivery.setPickupAt(LocalDateTime.now());
        } else if (newStatus == Delivery.DeliveryStatus.DELIVERED) {
            delivery.setDeliveredAt(LocalDateTime.now());
            // Mark donation as delivered
            delivery.getDonation().setStatus(Donation.DonationStatus.DELIVERED);
            donationRepository.save(delivery.getDonation());
            // Notify requester
            notificationService.sendNotification(delivery.getRequest().getRequester().getId(),
                "✅ Food Delivered!", "Your food request has been fulfilled successfully.",
                Notification.NotificationType.DELIVERY_SUCCESS);
        }

        return deliveryRepository.save(delivery);
    }

    public List<Delivery> getVolunteerDeliveries(Long volunteerId) {
        return deliveryRepository.findByVolunteerId(volunteerId);
    }

    public List<Delivery> getAllDeliveries() { return deliveryRepository.findAll(); }
}
