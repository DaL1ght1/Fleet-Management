package com.pcd.telemetryservice.infrastructure.persistence;

import com.pcd.telemetryservice.domain.LatestPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LatestPositionRepository extends JpaRepository<LatestPosition, UUID> {

    @Query("""
            select latest from LatestPosition latest
            where latest.vehicleId in (select vehicle.id from KnownVehicle vehicle where vehicle.deleted = false)
            """)
    List<LatestPosition> findForActiveVehicles();
}
