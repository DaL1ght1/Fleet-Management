package com.pcd.billingservice.domain;

import java.math.BigDecimal;
import java.util.Objects;

public record InvoiceLine(String description, BigDecimal amount) {

    public InvoiceLine {
        Objects.requireNonNull(description, "description is required");
        if (Objects.requireNonNull(amount, "amount is required").signum() < 0) {
            throw new IllegalArgumentException("Invoice lines must not be negative");
        }
        amount = Invoice.money(amount);
    }
}
