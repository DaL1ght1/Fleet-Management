package com.pcd.telemetryservice.application;

import com.pcd.telemetryservice.domain.LatestPosition;
import com.pcd.telemetryservice.domain.Position;
import com.pcd.telemetryservice.infrastructure.persistence.LatestPositionRepository;
import com.pcd.telemetryservice.infrastructure.persistence.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PositionQueryService {

    private final LatestPositionRepository latestPositions;
    private final PositionRepository positions;
    private final TelemetryProperties properties;

    public List<LatestPosition> fleet() {
        return latestPositions.findForActiveVehicles();
    }

    public Optional<LatestPosition> latest(UUID vehicleId) {
        return latestPositions.findById(vehicleId);
    }

    public List<Position> track(UUID vehicleId, Instant from, Instant to) {
        if (!to.isAfter(from)) {
            throw new IllegalArgumentException("to must be after from");
        }
        if (Duration.between(from, to).compareTo(properties.maxTrackWindow()) > 0) {
            throw new IllegalArgumentException("A track may cover at most %d days"
                    .formatted(properties.maxTrackWindow().toDays()));
        }
        return positions.findByVehicleIdAndRecordedAtBetweenOrderByRecordedAt(vehicleId, from, to,
                Limit.of(properties.maxTrackPoints()));
    }

    public Duration staleAfter() {
        return properties.staleAfter();
    }
}
