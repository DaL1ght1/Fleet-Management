package com.pcd.telemetryservice.infrastructure.persistence;

import com.pcd.telemetryservice.domain.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {

    Optional<Device> findByKeyHash(String keyHash);

    List<Device> findByVehicleIdOrderByCreatedAtDesc(UUID vehicleId);

    List<Device> findByVehicleIdAndRevokedAtIsNull(UUID vehicleId);
}
