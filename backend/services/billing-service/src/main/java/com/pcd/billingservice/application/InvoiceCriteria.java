package com.pcd.billingservice.application;

import com.pcd.billingservice.domain.InvoiceStatus;

import java.util.UUID;

public record InvoiceCriteria(InvoiceStatus status, UUID customerId, Boolean overdue) {

    public static final InvoiceCriteria ANY = new InvoiceCriteria(null, null, null);
}
