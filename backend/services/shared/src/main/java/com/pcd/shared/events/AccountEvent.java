package com.pcd.shared.events;

import java.time.Instant;
import java.util.UUID;

public record AccountEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID accountId,
        String email,
        String firstName,
        String lastName,
        String role) {

    public enum Type {
        ACCOUNT_REGISTERED,
        ACCOUNT_UPDATED,
        ACCOUNT_SIGNED_IN
    }
}
