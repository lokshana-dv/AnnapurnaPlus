package com.annapurna.controller;

import com.annapurna.model.Feedback;
import com.annapurna.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/** FeedbackController — Base URL: /api/feedback */
@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired private FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(feedbackService.submitFeedback(
            Long.valueOf(body.get("reviewerId").toString()),
            Long.valueOf(body.get("deliveryId").toString()),
            Integer.parseInt(body.get("rating").toString()),
            body.get("comment").toString()
        ));
    }

    @GetMapping("/delivery/{deliveryId}")
    public ResponseEntity<List<Feedback>> getByDelivery(@PathVariable Long deliveryId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByDelivery(deliveryId));
    }

    @GetMapping("/volunteer/{volunteerId}/rating")
    public ResponseEntity<Map<String, Double>> getVolunteerRating(@PathVariable Long volunteerId) {
        return ResponseEntity.ok(Map.of("averageRating", feedbackService.getVolunteerAverageRating(volunteerId)));
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }
}
