package com.pcd.tripsservice.Controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.tripsservice.Entity.Trip;
import com.pcd.tripsservice.Entity.Location;
import com.pcd.tripsservice.Entity.LocationDTO;
import com.pcd.tripsservice.Entity.TripType;
import com.pcd.tripsservice.Entity.TripStatus;
import com.pcd.tripsservice.graphql.types.CreateTripInput;
import com.pcd.tripsservice.graphql.types.UpdateTripInput;
import com.pcd.tripsservice.graphql.types.LocationInput;
import com.pcd.tripsservice.Service.TripService;
import com.pcd.tripsservice.Service.UserServiceClient;
import com.pcd.tripsservice.Service.VehicleServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class TripController {

    private final TripService tripService;
    private final UserServiceClient userServiceClient;
    private final VehicleServiceClient vehicleServiceClient;

    @DgsQuery
    public Trip getTripById(@InputArgument UUID id) {
        return tripService.GetTripById(id);
    }

    @DgsMutation
    public Trip createTrip(@InputArgument("input") CreateTripInput input) {
        log.info("Creating trip with input: {}", input);
        
        // Convert the GraphQL input to entity
        Trip trip = convertCreateInputToTrip(input);
        
        Trip result = tripService.CreateTrip(trip);
        log.info("Created trip: {}", result);
        return result;
    }
    
    @DgsMutation
    public Trip updateTrip(@InputArgument("input") UpdateTripInput input) {
        log.info("Updating trip with input: {}", input);
        
        // Convert the GraphQL input to entity and update
        Trip trip = convertUpdateInputToTrip(input);
        
        Trip result = tripService.UpdateTrip(trip);
        log.info("Updated trip: {}", result);
        return result;
    }
    
    @DgsMutation
    public Boolean deleteTrip(@InputArgument UUID id) {
        log.info("Deleting trip with id: {}", id);
        try {
            tripService.DeleteTrip(id);
            return true;
        } catch (Exception e) {
            log.error("Error deleting trip with id {}: {}", id, e.getMessage(), e);
            return false;
        }
    }

    @DgsQuery
    public List<Trip> getAllTrips() {
        return tripService.GetAllTrips();
    }

    /**
     * Federation data fetcher for Trip.driver field
     * This resolves the User entity when driver is requested
     */
    @DgsData(parentType = "Trip", field = "driver")
    public Object getDriver(DgsDataFetchingEnvironment dfe) {
        Trip trip = dfe.getSource();
        if (trip.getDriverId() == null) {
            log.debug("No driver ID for trip {}", trip.getId());
            return null;
        }
        
        try {
            log.debug("Fetching driver for trip {} with driverId {}", trip.getId(), trip.getDriverId());
            Object user = userServiceClient.getUserById(trip.getDriverId());
            
            if (user == null) {
                log.warn("Driver with ID {} not found for trip {}", trip.getDriverId(), trip.getId());
                // Return null instead of fallback to properly handle federation
                return null;
            }
            
            return user;
            
        } catch (Exception e) {
            log.error("Error fetching driver for trip {}: {}", trip.getId(), e.getMessage(), e);
            return null;
        }
    }

    /**
     * Federation data fetcher for Trip.vehicle field
     * This resolves the Vehicle entity when vehicle is requested
     */
    @DgsData(parentType = "Trip", field = "vehicle")
    public Object getVehicle(DgsDataFetchingEnvironment dfe) {
        Trip trip = dfe.getSource();
        if (trip.getVehicleId() == null) {
            return null;
        }
        
        try {
            log.debug("Fetching vehicle for trip {} with vehicleId {}", trip.getId(), trip.getVehicleId());
            return vehicleServiceClient.getVehicleById(trip.getVehicleId());
        } catch (Exception e) {
            log.error("Error fetching vehicle for trip {}: {}", trip.getId(), e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Data fetcher for Trip.waypoints field
     * Converts LocationDTO to Location for GraphQL response
     */
    @DgsData(parentType = "Trip", field = "waypoints")
    public List<Location> getWaypoints(DgsDataFetchingEnvironment dfe) {
        Trip trip = dfe.getSource();
        if (trip.getWaypoints() == null) {
            return new ArrayList<>();
        }
        
        return trip.getWaypoints().stream()
                .map(LocationDTO::toLocation)
                .toList();
    }
    
    /**
     * Convert CreateTripInput to Trip entity
     */
    private Trip convertCreateInputToTrip(CreateTripInput input) {
        Trip.TripBuilder builder = Trip.builder();
        
        // Required fields
        builder.vehicleId(input.getVehicleId());
        builder.driverId(input.getDriverId());
        builder.type(convertGraphQLTripTypeToEntity(input.getType()));
        builder.status(input.getStatus() != null ? convertGraphQLTripStatusToEntity(input.getStatus()) : TripStatus.SCHEDULED);
        
        // Date fields - convert from LocalDate to LocalDateTime
        if (input.getScheduledStartTime() != null) {
            builder.scheduledStartTime(input.getScheduledStartTime().atStartOfDay());
        }
        
        if (input.getScheduledEndTime() != null) {
            builder.scheduledEndTime(input.getScheduledEndTime().atStartOfDay());
        }
        
        if (input.getStartTime() != null) {
            builder.startTime(input.getStartTime().atStartOfDay());
        }
        
        if (input.getEndTime() != null) {
            builder.endTime(input.getEndTime().atStartOfDay());
        }
        
        // Location fields
        if (input.getStartLocation() != null) {
            builder.startLocation(convertLocationInputToEntity(input.getStartLocation()));
        }
        
        if (input.getEndLocation() != null) {
            builder.endLocation(convertLocationInputToEntity(input.getEndLocation()));
        }
        
        // Optional fields
        builder.distance(input.getDistance());
        builder.duration(input.getDuration());
        builder.estimatedDuration(input.getEstimatedDuration());
        builder.baseRate(input.getBaseRate());
        builder.totalCost(input.getTotalCost());
        builder.fuelCost(input.getFuelCost());
        builder.additionalFees(input.getAdditionalFees());
        builder.notes(input.getNotes());
        builder.customerNotes(input.getCustomerNotes());
        builder.internalNotes(input.getInternalNotes());
        
        // Waypoints - convert to LocationDTO for JSON storage
        if (input.getWaypoints() != null && !input.getWaypoints().isEmpty()) {
            List<LocationDTO> waypoints = input.getWaypoints().stream()
                    .map(this::convertLocationInputToEntity)
                    .map(LocationDTO::fromLocation)
                    .toList();
            builder.waypoints(waypoints);
        } else {
            builder.waypoints(new ArrayList<>());
        }
        
        return builder.build();
    }
    
    /**
     * Convert UpdateTripInput to Trip entity
     */
    private Trip convertUpdateInputToTrip(UpdateTripInput input) {
        // First get the existing trip
        Trip existingTrip = tripService.GetTripById(input.getId());
        if (existingTrip == null) {
            throw new RuntimeException("Trip not found with id: " + input.getId());
        }
        
        Trip.TripBuilder builder = existingTrip.toBuilder();
        
        // Update only non-null fields (PATCH-style update)
        if (input.getVehicleId() != null) {
            builder.vehicleId(input.getVehicleId());
        }
        
        if (input.getDriverId() != null) {
            builder.driverId(input.getDriverId());
        }
        
        if (input.getType() != null) {
            builder.type(convertGraphQLTripTypeToEntity(input.getType()));
        }
        
        if (input.getStatus() != null) {
            builder.status(convertGraphQLTripStatusToEntity(input.getStatus()));
        }
        
        // Date fields
        if (input.getScheduledStartTime() != null) {
            builder.scheduledStartTime(input.getScheduledStartTime().atStartOfDay());
        }
        
        if (input.getScheduledEndTime() != null) {
            builder.scheduledEndTime(input.getScheduledEndTime().atStartOfDay());
        }
        
        if (input.getStartTime() != null) {
            builder.startTime(input.getStartTime().atStartOfDay());
        }
        
        if (input.getEndTime() != null) {
            builder.endTime(input.getEndTime().atStartOfDay());
        }
        
        // Location fields
        if (input.getStartLocation() != null) {
            builder.startLocation(convertLocationInputToEntity(input.getStartLocation()));
        }
        
        if (input.getEndLocation() != null) {
            builder.endLocation(convertLocationInputToEntity(input.getEndLocation()));
        }
        
        // Optional fields - only update if not null
        if (input.getDistance() != null) {
            builder.distance(input.getDistance());
        }
        
        if (input.getDuration() != null) {
            builder.duration(input.getDuration());
        }
        
        if (input.getEstimatedDuration() != null) {
            builder.estimatedDuration(input.getEstimatedDuration());
        }
        
        if (input.getBaseRate() != null) {
            builder.baseRate(input.getBaseRate());
        }
        
        if (input.getTotalCost() != null) {
            builder.totalCost(input.getTotalCost());
        }
        
        if (input.getFuelCost() != null) {
            builder.fuelCost(input.getFuelCost());
        }
        
        if (input.getAdditionalFees() != null) {
            builder.additionalFees(input.getAdditionalFees());
        }
        
        if (input.getNotes() != null) {
            builder.notes(input.getNotes());
        }
        
        if (input.getCustomerNotes() != null) {
            builder.customerNotes(input.getCustomerNotes());
        }
        
        if (input.getInternalNotes() != null) {
            builder.internalNotes(input.getInternalNotes());
        }
        
        // Waypoints - convert to LocationDTO for JSON storage
        if (input.getWaypoints() != null) {
            List<LocationDTO> waypoints = input.getWaypoints().stream()
                    .map(this::convertLocationInputToEntity)
                    .map(LocationDTO::fromLocation)
                    .toList();
            builder.waypoints(waypoints);
        }
        
        return builder.build();
    }
    
    /**
     * Convert GraphQL LocationInput to Location entity
     */
    private Location convertLocationInputToEntity(LocationInput input) {
        return Location.builder()
                .latitude(input.getLatitude())
                .longitude(input.getLongitude())
                .address(input.getAddress())
                .city(input.getCity())
                .state(input.getState())
                .zipCode(input.getZipCode())
                .build();
    }
    
    /**
     * Convert GraphQL TripType to Entity TripType
     */
    private TripType convertGraphQLTripTypeToEntity(com.pcd.tripsservice.graphql.types.TripType graphqlType) {
        return TripType.valueOf(graphqlType.name());
    }
    
    /**
     * Convert GraphQL TripStatus to Entity TripStatus
     */
    private TripStatus convertGraphQLTripStatusToEntity(com.pcd.tripsservice.graphql.types.TripStatus graphqlStatus) {
        return TripStatus.valueOf(graphqlStatus.name());
    }
}
