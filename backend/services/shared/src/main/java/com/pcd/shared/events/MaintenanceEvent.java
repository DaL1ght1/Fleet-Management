package com.pcd.shared.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID workOrderId,
        UUID vehicleId,
        Kind kind,
        String title,
        LocalDate scheduledFor,
        LocalDate completedOn,
        BigDecimal totalCost) {

    public enum Type {
        WORK_ORDER_SCHEDULED,
        WORK_ORDER_STARTED,
        WORK_ORDER_COMPLETED,
        WORK_ORDER_CANCELLED,
        WORK_ORDER_OVERDUE
    }

    public enum Kind {
        PREVENTIVE,
        REPAIR,
        INSPECTION
    }
}
