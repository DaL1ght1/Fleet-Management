package com.pcd.telemetryservice.application;

import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.telemetryservice.domain.Device;
import com.pcd.telemetryservice.domain.DeviceKey;
import com.pcd.telemetryservice.domain.KnownVehicle;
import com.pcd.telemetryservice.infrastructure.persistence.DeviceRepository;
import com.pcd.telemetryservice.infrastructure.persistence.KnownVehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeviceService {

    private final DeviceRepository devices;
    private final KnownVehicleRepository knownVehicles;
    private final Clock clock;

    public record Registration(Device device, DeviceKey key) {
    }

    @Transactional(readOnly = true)
    public List<Device> forVehicle(UUID vehicleId) {
        return devices.findByVehicleIdOrderByCreatedAtDesc(vehicleId);
    }

    public Registration register(UUID vehicleId, String label) {
        if (!knownVehicles.existsByIdAndDeletedFalse(vehicleId)) {
            throw new BusinessRuleViolationException("Vehicle %s is unknown".formatted(vehicleId));
        }
        DeviceKey key = DeviceKey.generate();
        Device device = devices.save(Device.register(vehicleId, label, key, clock.instant()));
        return new Registration(device, key);
    }

    public Device revoke(UUID deviceId) {
        Device device = devices.findById(deviceId).orElseThrow(() -> new NotFoundException("Device", deviceId));
        device.revoke(clock.instant());
        return device;
    }

    public void onVehicleEvent(VehicleEvent event) {
        boolean deleted = event.type() == VehicleEvent.Type.VEHICLE_DELETED;
        KnownVehicle vehicle = knownVehicles.findById(event.vehicleId())
                .orElseGet(() -> knownVehicles.save(KnownVehicle.track(event.vehicleId())));
        if (vehicle.apply(event.occurredAt(), event.licensePlate(), deleted) && deleted) {
            devices.findByVehicleIdAndRevokedAtIsNull(event.vehicleId())
                    .forEach(device -> device.revoke(clock.instant()));
        }
    }
}
