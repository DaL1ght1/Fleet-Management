package com.pcd.shared.events;

import java.time.Instant;
import java.util.UUID;

public record CustomerEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID customerId,
        UUID accountId,
        String firstName,
        String lastName,
        String email) {

    public enum Type {
        CUSTOMER_REGISTERED,
        CUSTOMER_UPDATED,
        CUSTOMER_DELETED
    }
}
