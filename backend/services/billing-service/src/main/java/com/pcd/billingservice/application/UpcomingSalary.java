package com.pcd.billingservice.application;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpcomingSalary(UUID driverId, String driverName, LocalDate payday, BigDecimal amount) {
}
