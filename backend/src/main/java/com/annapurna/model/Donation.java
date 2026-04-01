package com.annapurna.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(name = "food_type")
    @Enumerated(EnumType.STRING)
    private FoodType foodType;

    private Integer quantity;

    @Column(name = "expiry_time")
    private LocalDateTime expiryTime;

    @Column(name = "pickup_address")
    private String pickupAddress;

    private Double latitude;
    private Double longitude;
    private String notes;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private DonationStatus status = DonationStatus.AVAILABLE;

    @Column(name = "priority_score")
    private Double priorityScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum FoodType { VEG, NON_VEG, PACKAGED }
    public enum DonationStatus { AVAILABLE, MATCHED, PICKUP_PROGRESS, DELIVERED, EXPIRED }

    public Long getId() { return id; }
    public User getDonor() { return donor; }
    public String getFoodName() { return foodName; }
    public FoodType getFoodType() { return foodType; }
    public Integer getQuantity() { return quantity; }
    public LocalDateTime getExpiryTime() { return expiryTime; }
    public String getPickupAddress() { return pickupAddress; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getNotes() { return notes; }
    public String getImageUrl() { return imageUrl; }
    public DonationStatus getStatus() { return status; }
    public Double getPriorityScore() { return priorityScore; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setDonor(User donor) { this.donor = donor; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public void setFoodType(FoodType foodType) { this.foodType = foodType; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setStatus(DonationStatus status) { this.status = status; }
    public void setPriorityScore(Double priorityScore) { this.priorityScore = priorityScore; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}