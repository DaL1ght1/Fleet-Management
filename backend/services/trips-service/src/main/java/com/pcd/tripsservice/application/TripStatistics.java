package com.pcd.tripsservice.application;

import com.pcd.tripsservice.domain.TripStatus;

import java.math.BigDecimal;
import java.util.Map;

public record TripStatistics(Map<TripStatus, Long> countsByStatus, BigDecimal totalDistanceKm, BigDecimal totalRevenue) {

    public long total() {
        return countsByStatus.values().stream().mapToLong(Long::longValue).sum();
    }

    public long count(TripStatus status) {
        return countsByStatus.getOrDefault(status, 0L);
    }
}
