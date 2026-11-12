package com.pcd.billingservice.application;

import java.math.BigDecimal;

public record ExpenseStatistics(BigDecimal maintenanceTotal, BigDecimal maintenanceUnpaid, BigDecimal salariesTotal,
                                BigDecimal salariesUnpaid, BigDecimal unpaidTotal, long unpaidCount,
                                BigDecimal paidThisMonth) {
}
