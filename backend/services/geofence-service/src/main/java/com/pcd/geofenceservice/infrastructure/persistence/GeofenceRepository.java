package com.pcd.geofenceservice.infrastructure.persistence;

import com.pcd.geofenceservice.domain.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GeofenceRepository extends JpaRepository<Geofence, UUID> {

    List<Geofence> findByActiveTrue();

    List<Geofence> findAllByOrderByName();
}
