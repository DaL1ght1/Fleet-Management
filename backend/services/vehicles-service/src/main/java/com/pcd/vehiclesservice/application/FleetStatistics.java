package com.pcd.vehiclesservice.application;

import com.pcd.vehiclesservice.domain.VehicleStatus;

import java.util.Map;

public record FleetStatistics(Map<VehicleStatus, Long> countsByStatus, long inUse, long maintenanceDue) {

    public long total() {
        return countsByStatus.values().stream().mapToLong(Long::longValue).sum();
    }

    public long count(VehicleStatus status) {
        return countsByStatus.getOrDefault(status, 0L);
    }
}
