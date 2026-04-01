package com.annapurna.repository;

import com.annapurna.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByVolunteerId(Long volunteerId);
    List<Delivery> findByStatus(Delivery.DeliveryStatus status);
    long countByStatus(Delivery.DeliveryStatus status);
}
