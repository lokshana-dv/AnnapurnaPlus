package com.annapurna.repository;

import com.annapurna.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByDeliveryId(Long deliveryId);

    // Average rating for a volunteer
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.delivery.volunteer.id = :volunteerId")
    Double getAverageRatingForVolunteer(Long volunteerId);
}
