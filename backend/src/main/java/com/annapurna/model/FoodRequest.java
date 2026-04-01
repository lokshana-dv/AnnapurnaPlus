package com.annapurna.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_requests")
public class FoodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(name = "number_of_people")
    private Integer numberOfPeople;

    @Column(name = "food_type_needed")
    @Enumerated(EnumType.STRING)
    private FoodTypeNeeded foodTypeNeeded;

    @Enumerated(EnumType.STRING)
    private UrgencyLevel urgencyLevel;

    private String location;
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum FoodTypeNeeded { VEG, NON_VEG, ANY }
    public enum UrgencyLevel { HIGH, MEDIUM, LOW }
    public enum RequestStatus { PENDING, MATCHED, FULFILLED, CANCELLED }

    public Long getId() { return id; }
    public User getRequester() { return requester; }
    public Integer getNumberOfPeople() { return numberOfPeople; }
    public FoodTypeNeeded getFoodTypeNeeded() { return foodTypeNeeded; }
    public UrgencyLevel getUrgencyLevel() { return urgencyLevel; }
    public String getLocation() { return location; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public RequestStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setRequester(User requester) { this.requester = requester; }
    public void setNumberOfPeople(Integer numberOfPeople) { this.numberOfPeople = numberOfPeople; }
    public void setFoodTypeNeeded(FoodTypeNeeded foodTypeNeeded) { this.foodTypeNeeded = foodTypeNeeded; }
    public void setUrgencyLevel(UrgencyLevel urgencyLevel) { this.urgencyLevel = urgencyLevel; }
    public void setLocation(String location) { this.location = location; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}