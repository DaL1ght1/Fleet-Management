package com.pcd.geofenceservice.infrastructure.persistence;

import com.pcd.geofenceservice.domain.ZoneOccupancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ZoneOccupancyRepository extends JpaRepository<ZoneOccupancy, ZoneOccupancy.Key> {

    List<ZoneOccupancy> findByIdVehicleId(UUID vehicleId);

    @Query("select o.id.geofenceId from ZoneOccupancy o where o.id.vehicleId = :vehicleId and o.inside = true")
    List<UUID> findGeofencesContaining(UUID vehicleId);

    long countByIdGeofenceIdAndInsideTrue(UUID geofenceId);

    @Modifying
    @Query("delete from ZoneOccupancy o where o.id.geofenceId = :geofenceId")
    void deleteByGeofenceId(UUID geofenceId);
}
