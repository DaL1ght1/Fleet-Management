package com.pcd.telemetryservice.infrastructure.persistence;

import com.pcd.telemetryservice.domain.KnownVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface KnownVehicleRepository extends JpaRepository<KnownVehicle, UUID> {

    boolean existsByIdAndDeletedFalse(UUID id);
}
