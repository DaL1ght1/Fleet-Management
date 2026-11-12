package com.pcd.geofenceservice.infrastructure.persistence;

import com.pcd.geofenceservice.domain.GeofenceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.UUID;

public interface GeofenceAlertRepository extends JpaRepository<GeofenceAlert, UUID>,
        JpaSpecificationExecutor<GeofenceAlert> {

    long countByAcknowledgedAtIsNull();

    @Modifying
    @Query("""
            update GeofenceAlert alert set alert.acknowledgedAt = :now, alert.acknowledgedBy = :accountId
            where alert.acknowledgedAt is null
            """)
    int acknowledgeAll(UUID accountId, Instant now);
}
