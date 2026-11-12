package com.pcd.telemetryservice.infrastructure.persistence;

import com.pcd.telemetryservice.domain.Position;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {

    List<Position> findByVehicleIdAndRecordedAtBetweenOrderByRecordedAt(UUID vehicleId, Instant from, Instant to,
                                                                         Limit limit);

    @Modifying
    @Query("delete from Position p where p.recordedAt < :threshold")
    int deleteRecordedBefore(Instant threshold);
}
