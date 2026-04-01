package com.annapurna.service;

import com.annapurna.model.*;
import com.annapurna.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private DeliveryRepository deliveryRepository;
    @Autowired private UserRepository userRepository;

    public Feedback submitFeedback(Long reviewerId, Long deliveryId, int rating, String comment) {
        User reviewer = userRepository.findById(reviewerId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Delivery delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new RuntimeException("Delivery not found"));

        Feedback fb = new Feedback();
        fb.setReviewer(reviewer);
        fb.setDelivery(delivery);
        fb.setRating(rating);
        fb.setComment(comment);
        fb.setCreatedAt(LocalDateTime.now());
        return feedbackRepository.save(fb);
    }

    public List<Feedback> getFeedbackByDelivery(Long deliveryId) {
        return feedbackRepository.findByDeliveryId(deliveryId);
    }

    public Double getVolunteerAverageRating(Long volunteerId) {
        Double avg = feedbackRepository.getAverageRatingForVolunteer(volunteerId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public List<Feedback> getAllFeedback() { return feedbackRepository.findAll(); }
}
