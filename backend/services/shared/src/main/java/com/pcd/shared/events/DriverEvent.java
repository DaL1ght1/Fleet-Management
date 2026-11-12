package com.pcd.shared.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DriverEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID driverId,
        UUID accountId,
        String firstName,
        String lastName,
        String email,
        Status status,
        LocalDate licenseExpiryDate,
        LocalDate hireDate,
        BigDecimal monthlySalary) {

    public enum Type {
        DRIVER_REGISTERED,
        DRIVER_UPDATED,
        DRIVER_STATUS_CHANGED,
        DRIVER_DELETED
    }

    public enum Status {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        ON_LEAVE
    }
}
