package com.pcd.telemetryservice.application;

import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehiclePositionEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import com.pcd.telemetryservice.domain.Device;
import com.pcd.telemetryservice.domain.DeviceKey;
import com.pcd.telemetryservice.domain.LatestPosition;
import com.pcd.telemetryservice.domain.Position;
import com.pcd.telemetryservice.domain.PositionReport;
import com.pcd.telemetryservice.infrastructure.persistence.DeviceRepository;
import com.pcd.telemetryservice.infrastructure.persistence.LatestPositionRepository;
import com.pcd.telemetryservice.infrastructure.persistence.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngestionService {

    private final DeviceRepository devices;
    private final PositionRepository positions;
    private final LatestPositionRepository latestPositions;
    private final DomainEventPublisher events;
    private final TelemetryProperties properties;
    private final Clock clock;

    @Transactional
    public int ingest(String rawDeviceKey, List<PositionReport> reports) {
        Device device = authenticate(rawDeviceKey);
        if (reports.isEmpty()) {
            return 0;
        }
        if (reports.size() > properties.maxBatchSize()) {
            throw new IllegalArgumentException("A batch may contain at most %d positions"
                    .formatted(properties.maxBatchSize()));
        }
        Instant now = clock.instant();
        reports.forEach(report -> report.ensureNotFromTheFuture(now));
        List<Position> recorded = reports.stream()
                .sorted(Comparator.comparing(PositionReport::recordedAt))
                .map(report -> Position.record(device, report, now))
                .toList();
        positions.saveAll(recorded);
        LatestPosition latest = latestPositions.findById(device.getVehicleId())
                .orElseGet(() -> LatestPosition.from(recorded.getFirst()));
        recorded.forEach(latest::advanceTo);
        latestPositions.save(latest);
        recorded.forEach(position -> publish(position, now));
        device.markSeen(now);
        return recorded.size();
    }

    @Transactional
    public int purgeExpired() {
        return positions.deleteRecordedBefore(clock.instant().minus(properties.retention()));
    }

    private Device authenticate(String rawDeviceKey) {
        if (rawDeviceKey == null || rawDeviceKey.isBlank()) {
            throw new DeviceAuthenticationException();
        }
        Device device = devices.findByKeyHash(new DeviceKey(rawDeviceKey.strip()).hash())
                .orElseThrow(DeviceAuthenticationException::new);
        if (device.isRevoked()) {
            throw new DeviceAuthenticationException();
        }
        return device;
    }

    private void publish(Position position, Instant now) {
        events.publish(Topics.VEHICLE_POSITIONS, position.getVehicleId().toString(), new VehiclePositionEvent(
                UUID.randomUUID(), now, position.getVehicleId(), position.getDeviceId(), position.getRecordedAt(),
                position.getLatitude(), position.getLongitude(), position.getSpeedKph(),
                position.getHeadingDegrees(), position.getOdometerKm(), position.getFuelLevelPercent(),
                position.getIgnitionOn()));
    }
}
