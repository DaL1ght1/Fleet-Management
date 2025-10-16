package com.pcd.userservice.Service;

import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.config.KafkaConfig;
import com.pcd.userservice.Entity.Driver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for publishing driver events to Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DriverEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishDriverEvent(DriverEvent event) {
        try {
            event.setTimestamp(LocalDateTime.now());
            event.setCorrelationId(UUID.randomUUID().toString());
            event.setSource("user-service");

            String key = event.getDriverId().toString();
            
            kafkaTemplate.send(KafkaConfig.DRIVER_EVENTS_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Published driver event: {} for driver: {}", event.getEventType(), event.getDriverId());
                    } else {
                        log.error("Failed to publish driver event: {}", ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Error publishing driver event: {}", e.getMessage(), e);
        }
    }

    public void publishDriverCreated(Driver driver) {
        DriverEvent event = DriverEvent.builder()
                .driverId(driver.getId())
                .eventType(DriverEvent.EventType.DRIVER_CREATED)
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phoneNumber(driver.getPhoneNumber())
                .licenseNumber(driver.getLicenseNumber())
                .licenseExpiryDate(driver.getLicenseExpiryDate())
                .status(driver.getStatus())
                .dateOfBirth(driver.getDateOfBirth())
                .hireDate(driver.getHireDate())
                .emergencyContactName(driver.getEmergencyContactName())
                .emergencyContactPhone(driver.getEmergencyContactPhone())
                .currentTripId(driver.getCurrentTripId())
                .rating(driver.getRating())
                .build();
        publishDriverEvent(event);
    }

    public void publishDriverUpdated(Driver driver) {
        DriverEvent event = DriverEvent.builder()
                .driverId(driver.getId())
                .eventType(DriverEvent.EventType.DRIVER_UPDATED)
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phoneNumber(driver.getPhoneNumber())
                .licenseNumber(driver.getLicenseNumber())
                .licenseExpiryDate(driver.getLicenseExpiryDate())
                .status(driver.getStatus())
                .dateOfBirth(driver.getDateOfBirth())
                .hireDate(driver.getHireDate())
                .emergencyContactName(driver.getEmergencyContactName())
                .emergencyContactPhone(driver.getEmergencyContactPhone())
                .currentTripId(driver.getCurrentTripId())
                .rating(driver.getRating())
                .build();
        publishDriverEvent(event);
    }

    public void publishDriverDeleted(UUID driverId) {
        DriverEvent event = DriverEvent.builder()
                .driverId(driverId)
                .eventType(DriverEvent.EventType.DRIVER_DELETED)
                .build();
        publishDriverEvent(event);
    }

    public void publishDriverStatusChanged(Driver driver) {
        DriverEvent event = DriverEvent.builder()
                .driverId(driver.getId())
                .eventType(DriverEvent.EventType.DRIVER_STATUS_CHANGED)
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phoneNumber(driver.getPhoneNumber())
                .licenseNumber(driver.getLicenseNumber())
                .status(driver.getStatus())
                .build();
        publishDriverEvent(event);
    }

    public void publishDriverAssignedToTrip(Driver driver, UUID tripId) {
        DriverEvent event = DriverEvent.builder()
                .driverId(driver.getId())
                .eventType(DriverEvent.EventType.DRIVER_ASSIGNED_TO_TRIP)
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .currentTripId(tripId)
                .build();
        publishDriverEvent(event);
    }

    public void publishDriverTripCompleted(Driver driver, UUID completedTripId) {
        DriverEvent event = DriverEvent.builder()
                .driverId(driver.getId())
                .eventType(DriverEvent.EventType.DRIVER_TRIP_COMPLETED)
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .currentTripId(completedTripId)
                .rating(driver.getRating())
                .build();
        publishDriverEvent(event);
    }
}