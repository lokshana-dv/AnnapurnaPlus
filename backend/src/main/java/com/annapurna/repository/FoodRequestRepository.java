package com.annapurna.repository;

import com.annapurna.model.FoodRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {
    List<FoodRequest> findByRequesterId(Long requesterId);
    List<FoodRequest> findByStatus(FoodRequest.RequestStatus status);
    long countByStatus(FoodRequest.RequestStatus status);
}
