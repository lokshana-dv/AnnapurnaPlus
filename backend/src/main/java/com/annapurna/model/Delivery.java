package com.annapurna.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "donation_id")
    private Donation donation;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private FoodRequest request;

    @ManyToOne
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.DONATED;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "pickup_at")
    private LocalDateTime pickupAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DeliveryStatus { DONATED, ACCEPTED, PICKUP_IN_PROGRESS, DELIVERED }

    public Long getId() { return id; }
    public Donation getDonation() { return donation; }
    public FoodRequest getRequest() { return request; }
    public User getVolunteer() { return volunteer; }
    public DeliveryStatus getStatus() { return status; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public LocalDateTime getPickupAt() { return pickupAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setDonation(Donation donation) { this.donation = donation; }
    public void setRequest(FoodRequest request) { this.request = request; }
    public void setVolunteer(User volunteer) { this.volunteer = volunteer; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
    public void setPickupAt(LocalDateTime pickupAt) { this.pickupAt = pickupAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}