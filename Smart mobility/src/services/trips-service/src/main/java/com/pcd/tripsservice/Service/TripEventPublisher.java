package com.pcd.tripsservice.Service;

import com.pcd.shared.events.TripEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for publishing trip events to Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TripEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TRIP_EVENTS_TOPIC = "smart-mobility.trip.events";

    /**
     * Publish trip event to Kafka
     */
    public void publishTripEvent(TripEvent event) {
        try {
            // Set metadata
            event.setTimestamp(LocalDateTime.now());
            event.setCorrelationId(UUID.randomUUID().toString());
            event.setSource("trips-service");

            String key = event.getTripId().toString();
            
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(TRIP_EVENTS_TOPIC, key, event);
            
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Published trip event: {} for trip: {} with offset: {}", 
                            event.getEventType(), event.getTripId(), result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to publish trip event: {} for trip: {}", 
                            event.getEventType(), event.getTripId(), ex);
                }
            });
            
        } catch (Exception e) {
            log.error("Error publishing trip event: {}", e.getMessage(), e);
        }
    }

    /**
     * Publish trip created event
     */
    public void publishTripCreated(UUID tripId, UUID vehicleId, UUID driverId, 
                                  TripEvent.TripType type, LocalDateTime scheduledStartTime) {
        TripEvent event = TripEvent.builder()
                .tripId(tripId)
                .eventType(TripEvent.EventType.TRIP_CREATED)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .type(type)
                .status(TripEvent.TripStatus.SCHEDULED)
                .scheduledStartTime(scheduledStartTime)
                .build();
                
        publishTripEvent(event);
    }

    /**
     * Publish trip status changed event
     */
    public void publishTripStatusChanged(UUID tripId, TripEvent.TripStatus newStatus, 
                                       TripEvent.TripStatus oldStatus) {
        TripEvent event = TripEvent.builder()
                .tripId(tripId)
                .eventType(TripEvent.EventType.TRIP_UPDATED)
                .status(newStatus)
                .build();
                
        publishTripEvent(event);
        
        log.info("Trip {} status changed from {} to {}", tripId, oldStatus, newStatus);
    }

    /**
     * Publish trip started event
     */
    public void publishTripStarted(UUID tripId, LocalDateTime startTime) {
        TripEvent event = TripEvent.builder()
                .tripId(tripId)
                .eventType(TripEvent.EventType.TRIP_STARTED)
                .status(TripEvent.TripStatus.IN_PROGRESS)
                .startTime(startTime)
                .build();
                
        publishTripEvent(event);
    }

    /**
     * Publish trip completed event
     */
    public void publishTripCompleted(UUID tripId, LocalDateTime endTime, 
                                   java.math.BigDecimal totalCost, Integer duration) {
        TripEvent event = TripEvent.builder()
                .tripId(tripId)
                .eventType(TripEvent.EventType.TRIP_COMPLETED)
                .status(TripEvent.TripStatus.COMPLETED)
                .endTime(endTime)
                .totalCost(totalCost)
                .duration(duration)
                .build();
                
        publishTripEvent(event);
    }
}
