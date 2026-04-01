package com.annapurna.repository;

import com.annapurna.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    // Get all donations by a specific donor
    List<Donation> findByDonorId(Long donorId);

    // Get all available donations (for matching)
    List<Donation> findByStatus(Donation.DonationStatus status);

    // Get donations ordered by priority score (AI matching)
    @Query("SELECT d FROM Donation d WHERE d.status = 'AVAILABLE' ORDER BY d.priorityScore DESC")
    List<Donation> findAvailableOrderedByPriority();

    // Count by status for analytics
    long countByStatus(Donation.DonationStatus status);
}
