package com.pcd.shared.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceEvent(
        UUID eventId,
        Type type,
        Instant occurredAt,
        UUID invoiceId,
        String number,
        UUID tripId,
        UUID customerId,
        BigDecimal total,
        LocalDate dueDate) {

    public enum Type {
        INVOICE_DRAFTED,
        INVOICE_ISSUED,
        INVOICE_PAID,
        INVOICE_VOIDED,
        INVOICE_OVERDUE
    }
}
