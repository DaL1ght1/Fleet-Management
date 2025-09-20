package com.pcd.userservice.Service;

import com.pcd.userservice.events.UserEvent;
import com.pcd.userservice.Entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for publishing user events to Kafka
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String USER_EVENTS_TOPIC = "smart-mobility.user.events";

    public void publishUserEvent(UserEvent event) {
        try {
            event.setTimestamp(LocalDateTime.now());
            event.setCorrelationId(UUID.randomUUID().toString());
            event.setSource("user-service");

            String key = event.getUserId().toString();
            
            kafkaTemplate.send(USER_EVENTS_TOPIC, key, event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Published user event: {} for user: {}", event.getEventType(), event.getUserId());
                    } else {
                        log.error("Failed to publish user event: {}", ex.getMessage());
                    }
                });
        } catch (Exception e) {
            log.error("Error publishing user event: {}", e.getMessage(), e);
        }
    }

    public void publishUserCreated(User user) {
        UserEvent event = UserEvent.builder()
                .userId(user.getId())
                .eventType(UserEvent.EventType.USER_CREATED)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .licenseNumber(user.getLicenseNumber())
                .build();
        publishUserEvent(event);
    }

    public void publishUserUpdated(User user) {
        UserEvent event = UserEvent.builder()
                .userId(user.getId())
                .eventType(UserEvent.EventType.USER_UPDATED)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .licenseNumber(user.getLicenseNumber())
                .build();
        publishUserEvent(event);
    }

    public void publishUserDeleted(UUID userId) {
        UserEvent event = UserEvent.builder()
                .userId(userId)
                .eventType(UserEvent.EventType.USER_DELETED)
                .build();
        publishUserEvent(event);
    }
}
