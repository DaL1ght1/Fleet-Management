package com.pcd.tripsservice.Service;

import com.pcd.tripsservice.Entity.Trip;

import java.util.List;
import java.util.UUID;

public interface TripService {

    Trip CreateTrip(Trip trip);
    Trip UpdateTrip(Trip trip);
    Trip GetTripById(UUID id);
    void DeleteTrip(UUID id);
    List<Trip> GetAllTrips();

}
