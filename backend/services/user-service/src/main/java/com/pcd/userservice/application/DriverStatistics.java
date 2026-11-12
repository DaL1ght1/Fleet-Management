package com.pcd.userservice.application;

import com.pcd.userservice.domain.DriverStatus;

import java.util.Map;

public record DriverStatistics(Map<DriverStatus, Long> countsByStatus, long available, long onTrip,
                               long licensesExpiringSoon) {

    public long total() {
        return countsByStatus.values().stream().mapToLong(Long::longValue).sum();
    }

    public long count(DriverStatus status) {
        return countsByStatus.getOrDefault(status, 0L);
    }
}
