package com.pcd.billingservice.application;

import java.math.BigDecimal;

public record BillingStatistics(long drafts, BigDecimal outstanding, BigDecimal overdue, long overdueCount,
                                BigDecimal collectedThisMonth) {
}
