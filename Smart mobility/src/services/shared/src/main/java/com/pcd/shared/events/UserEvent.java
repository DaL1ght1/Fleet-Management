package com.pcd.shared.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User event for Kafka messaging between services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
    
    public enum EventType {
        USER_CREATED,
        USER_UPDATED,
        USER_DELETED,
        USER_STATUS_CHANGED
    }
    
    private UUID userId;
    private EventType eventType;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDateTime timestamp;
    private String correlationId;
    private String source;
}
