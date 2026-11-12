package com.pcd.notificationservice.infrastructure.persistence;

import com.pcd.notificationservice.domain.KnownVehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface KnownVehicleRepository extends JpaRepository<KnownVehicle, UUID> {
}
