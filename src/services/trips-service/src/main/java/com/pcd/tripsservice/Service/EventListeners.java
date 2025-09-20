package com.pcd.tripsservice.Service;


import com.pcd.shared.events.UserEvent;
import com.pcd.shared.events.VehicleEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka event listeners for trips service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventListeners {

    private final UserServiceClient userServiceClient;
    private final VehicleServiceClient vehicleServiceClient;

    @KafkaListener(topics = "smart-mobility.user.events", groupId = "trips-service-group")
    public void handleUserEvent(
            @Payload UserEvent userEvent,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("Received user event: {} for user: {}", userEvent.getEventType(), userEvent.getUserId());

            switch (userEvent.getEventType()) {
                case USER_UPDATED:
                    userServiceClient.clearUserCache(userEvent.getUserId());
                    break;
                case USER_DELETED:
                    userServiceClient.clearUserCache(userEvent.getUserId());
                    log.warn("User deleted: {}. Consider handling associated trips.", userEvent.getUserId());
                    break;
                case USER_CREATED:
                    log.info("New user created: {} {}", userEvent.getFirstName(), userEvent.getLastName());
                    break;
                default:
                    log.debug("Unhandled user event type: {}", userEvent.getEventType());
            }

            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing user event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "smart-mobility.vehicle.events", groupId = "trips-service-group")
    public void handleVehicleEvent(
            @Payload VehicleEvent vehicleEvent,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            Acknowledgment acknowledgment) {
        
        try {
            log.info("Received vehicle event: {} for vehicle: {}", vehicleEvent.getEventType(), vehicleEvent.getVehicleId());

            switch (vehicleEvent.getEventType()) {
                case VEHICLE_UPDATED:
                    vehicleServiceClient.clearVehicleCache(vehicleEvent.getVehicleId());
                    break;
                case VEHICLE_STATUS_CHANGED:
                    vehicleServiceClient.clearVehicleCache(vehicleEvent.getVehicleId());
                    handleVehicleStatusChange(vehicleEvent);
                    break;
                case VEHICLE_DELETED:
                    vehicleServiceClient.clearVehicleCache(vehicleEvent.getVehicleId());
                    log.warn("Vehicle deleted: {}. Consider handling associated trips.", vehicleEvent.getVehicleId());
                    break;
                case VEHICLE_CREATED:
                    log.info("New vehicle created: {} {}", vehicleEvent.getMake(), vehicleEvent.getModel());
                    break;
                default:
                    log.debug("Unhandled vehicle event type: {}", vehicleEvent.getEventType());
            }

            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing vehicle event: {}", e.getMessage(), e);
        }
    }

    private void handleVehicleStatusChange(VehicleEvent vehicleEvent) {
        if (vehicleEvent.getStatus() == VehicleEvent.Status.MAINTENANCE) {
            log.warn("Vehicle {} is now in maintenance. Active trips may be affected.", vehicleEvent.getVehicleId());
        } else if (vehicleEvent.getStatus() == VehicleEvent.Status.INACTIVE) {
            log.warn("Vehicle {} is now inactive. Active trips may be affected.", vehicleEvent.getVehicleId());
        }
    }
}
