package com.pcd.tripsservice.Service.Implementation;

import com.pcd.tripsservice.Entity.Trip;
import com.pcd.tripsservice.Repository.TripRepository;
import com.pcd.tripsservice.Service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;

    @Override
    public Trip CreateTrip(Trip trip) {
        return tripRepository.save(trip);
    }
    @Override
    public Trip UpdateTrip(Trip updatedTrip) {
        Trip existingTrip = tripRepository.findById(updatedTrip.getId())
                .orElseThrow(() -> new IllegalStateException("Trip not found with id: " + updatedTrip.getId()));

        // Core fields
        if (updatedTrip.getVehicleId() != null) {existingTrip.setVehicleId(updatedTrip.getVehicleId());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getDriverId() != null) {existingTrip.setDriverId(updatedTrip.getDriverId());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getType() != null) {existingTrip.setType(updatedTrip.getType());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getStatus() != null) {existingTrip.setStatus(updatedTrip.getStatus());
            existingTrip.setUpdatedAt(LocalDateTime.now());}

        // Locations
        if (updatedTrip.getStartLocation() != null) {existingTrip.setStartLocation(updatedTrip.getStartLocation());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getEndLocation() != null) {existingTrip.setEndLocation(updatedTrip.getEndLocation());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getWaypoints() != null && !updatedTrip.getWaypoints().isEmpty())
        {existingTrip.setWaypoints(updatedTrip.getWaypoints());
            existingTrip.setUpdatedAt(LocalDateTime.now());}

        // Times
        if (updatedTrip.getStartTime() != null) {existingTrip.setStartTime(updatedTrip.getStartTime());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getEndTime() != null) {existingTrip.setEndTime(updatedTrip.getEndTime());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getScheduledStartTime() != null) {existingTrip.setScheduledStartTime(updatedTrip.getScheduledStartTime());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getScheduledEndTime() != null) {existingTrip.setScheduledEndTime(updatedTrip.getScheduledEndTime());
            existingTrip.setUpdatedAt(LocalDateTime.now());}

        // Metrics
        if (updatedTrip.getDistance() != null) {existingTrip.setDistance(updatedTrip.getDistance());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getDuration() != null) {existingTrip.setDuration(updatedTrip.getDuration());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getEstimatedDuration() != null) {existingTrip.setEstimatedDuration(updatedTrip.getEstimatedDuration());
            existingTrip.setUpdatedAt(LocalDateTime.now());}

        // Financials
        if (updatedTrip.getBaseRate() != null) {existingTrip.setBaseRate(updatedTrip.getBaseRate());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getTotalCost() != null) {existingTrip.setTotalCost(updatedTrip.getTotalCost());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getFuelCost() != null) {existingTrip.setFuelCost(updatedTrip.getFuelCost());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getAdditionalFees() != null) {existingTrip.setAdditionalFees(updatedTrip.getAdditionalFees());
            existingTrip.setUpdatedAt(LocalDateTime.now());}

        // Notes
        if (updatedTrip.getNotes() != null) {existingTrip.setNotes(updatedTrip.getNotes());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getCustomerNotes() != null) {existingTrip.setCustomerNotes(updatedTrip.getCustomerNotes());
            existingTrip.setUpdatedAt(LocalDateTime.now());}
        if (updatedTrip.getInternalNotes() != null) {existingTrip.setInternalNotes(updatedTrip.getInternalNotes());
            existingTrip.setUpdatedAt(LocalDateTime.now());}

        return tripRepository.save(existingTrip);
    }



    @Override
    public Trip GetTripById(UUID id) {
        return tripRepository.findById(id).orElseThrow(()->new IllegalStateException("Trip not found with id: " + id));
    }

    @Override
    public void DeleteTrip(UUID id) {
        if (!tripRepository.existsById(id)) {
            throw new IllegalStateException("Trip not found with id: " + id);
        }
        tripRepository.deleteById(id);

    }

    @Override
    public List<Trip> GetAllTrips() {
        return tripRepository.findAll();
    }
}
