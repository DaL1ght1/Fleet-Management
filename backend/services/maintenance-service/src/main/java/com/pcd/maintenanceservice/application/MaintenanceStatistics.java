package com.pcd.maintenanceservice.application;

import java.math.BigDecimal;

public record MaintenanceStatistics(long scheduled, long inProgress, long overdue, long completedThisMonth,
                                    BigDecimal costThisMonth) {
}
