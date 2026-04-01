package com.annapurna.controller;

import com.annapurna.model.Delivery;
import com.annapurna.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/** DeliveryController — Base URL: /api/deliveries */
@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    @Autowired private DeliveryService deliveryService;

    /** POST /api/deliveries/accept — volunteer accepts delivery */
    @PostMapping("/accept")
    public ResponseEntity<Delivery> acceptDelivery(@RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(deliveryService.acceptDelivery(
            body.get("donationId"), body.get("requestId"), body.get("volunteerId")
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(deliveryService.updateStatus(id, status));
    }

    @GetMapping("/volunteer/{volunteerId}")
    public ResponseEntity<List<Delivery>> getByVolunteer(@PathVariable Long volunteerId) {
        return ResponseEntity.ok(deliveryService.getVolunteerDeliveries(volunteerId));
    }

    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.getAllDeliveries());
    }
}
