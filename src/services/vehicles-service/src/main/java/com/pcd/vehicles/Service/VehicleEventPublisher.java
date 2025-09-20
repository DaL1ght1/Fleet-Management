package com.pcd.vehicles.Service;

import com.pcd.vehicles.events.VehicleEvent;
import com.pcd.vehicles.Entity.Vehicle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for publishing vehicle events to Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String VEHICLE_EVENTS_TOPIC = "smart-mobility.vehicle.events";

    public void publishVehicleEvent(VehicleEvent event) {
        try {
            event.setTimestamp(LocalDateTime.now());
            event.setCorrelationId(UUID.randomUUID().toString());
            event.setSource("vehicle-service");

            String key = event.getVehicleId().toString();
            
            kafkaTemplate.send(VEHICLE_EVENTS_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Published vehicle event: {} for vehicle: {}", event.getEventType(), event.getVehicleId());
                    } else {
                        log.error("Failed to publish vehicle event: {}", ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Error publishing vehicle event: {}", e.getMessage(), e);
        }
    }

    public void publishVehicleCreated(Vehicle vehicle) {
        VehicleEvent event = VehicleEvent.builder()
                .vehicleId(vehicle.getId())
                .eventType(VehicleEvent.EventType.VEHICLE_CREATED)
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .licensePlate(vehicle.getLicensePlate())
                .status(convertStatus(vehicle.getStatus()))
                .vin(vehicle.getVin())
                .color(vehicle.getColor())
                .mileage(vehicle.getMileage())
                .fuelType(convertFuelType(vehicle.getFuelType()))
                .seatingCapacity(vehicle.getSeatingCapacity())
                .rentalPricePerDay(vehicle.getRentalPricePerDay())
                .gpsEnabled(vehicle.isGpsEnabled())
                .build();
        publishVehicleEvent(event);
    }

    public void publishVehicleUpdated(Vehicle vehicle) {
        VehicleEvent event = VehicleEvent.builder()
                .vehicleId(vehicle.getId())
                .eventType(VehicleEvent.EventType.VEHICLE_UPDATED)
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .licensePlate(vehicle.getLicensePlate())
                .status(convertStatus(vehicle.getStatus()))
                .vin(vehicle.getVin())
                .color(vehicle.getColor())
                .mileage(vehicle.getMileage())
                .fuelType(convertFuelType(vehicle.getFuelType()))
                .seatingCapacity(vehicle.getSeatingCapacity())
                .rentalPricePerDay(vehicle.getRentalPricePerDay())
                .gpsEnabled(vehicle.isGpsEnabled())
                .build();
        publishVehicleEvent(event);
    }

    public void publishVehicleStatusChanged(UUID vehicleId, VehicleEvent.Status newStatus, VehicleEvent.Status oldStatus) {
        VehicleEvent event = VehicleEvent.builder()
                .vehicleId(vehicleId)
                .eventType(VehicleEvent.EventType.VEHICLE_STATUS_CHANGED)
                .status(newStatus)
                .build();
        publishVehicleEvent(event);
        log.info("Vehicle {} status changed from {} to {}", vehicleId, oldStatus, newStatus);
    }

    public void publishVehicleDeleted(UUID vehicleId) {
        VehicleEvent event = VehicleEvent.builder()
                .vehicleId(vehicleId)
                .eventType(VehicleEvent.EventType.VEHICLE_DELETED)
                .build();
        publishVehicleEvent(event);
    }

    private VehicleEvent.Status convertStatus(com.pcd.vehicles.Entity.Enum.Status entityStatus) {
        return switch (entityStatus) {
            case ACTIVE -> VehicleEvent.Status.ACTIVE;
            case INACTIVE -> VehicleEvent.Status.INACTIVE;
            case MAINTENANCE -> VehicleEvent.Status.MAINTENANCE;
        };
    }

    private VehicleEvent.FuelType convertFuelType(com.pcd.vehicles.Entity.Enum.FuelType entityFuelType) {
        return switch (entityFuelType) {
            case GASOLINE -> VehicleEvent.FuelType.GASOLINE;
            case DIESEL -> VehicleEvent.FuelType.DIESEL;
            case ELECTRIC -> VehicleEvent.FuelType.ELECTRIC;
            case HYBRID -> VehicleEvent.FuelType.HYBRID;
        };
    }
}
