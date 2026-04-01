package com.annapurna.service;

import com.annapurna.model.FoodRequest;
import com.annapurna.model.User;
import com.annapurna.repository.FoodRequestRepository;
import com.annapurna.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class FoodRequestService {

    @Autowired private FoodRequestRepository requestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MatchingService matchingService;

    public FoodRequest createRequest(Long requesterId, FoodRequest request) {
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        request.setRequester(requester);
        request.setStatus(FoodRequest.RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        return requestRepository.save(request);
    }

    public List<FoodRequest> getAllRequests() { return requestRepository.findAll(); }
    public List<FoodRequest> getRequestsByUser(Long userId) { return requestRepository.findByRequesterId(userId); }

    /** Use AI matching engine to find best donations for this request */
    public List<Map<String, Object>> getMatchedDonations(Long requestId) {
        FoodRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        return matchingService.findBestMatches(request, 5);
    }

    public FoodRequest updateStatus(Long id, String status) {
        FoodRequest r = requestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        r.setStatus(FoodRequest.RequestStatus.valueOf(status.toUpperCase()));
        return requestRepository.save(r);
    }

    public void deleteRequest(Long id) { requestRepository.deleteById(id); }
}
