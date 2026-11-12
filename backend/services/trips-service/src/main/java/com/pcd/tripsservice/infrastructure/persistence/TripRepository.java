package com.pcd.tripsservice.infrastructure.persistence;

import com.pcd.tripsservice.domain.Trip;
import com.pcd.tripsservice.domain.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface TripRepository extends JpaRepository<Trip, UUID>, JpaSpecificationExecutor<Trip> {

    @Query("""
            select count(t) > 0 from Trip t
            where t.vehicleId = :vehicleId
              and t.id <> :excludedTripId
              and t.status in :statuses
              and t.scheduledStart < :end
              and t.scheduledEnd > :start
            """)
    boolean existsVehicleOverlap(@Param("vehicleId") UUID vehicleId,
                                 @Param("excludedTripId") UUID excludedTripId,
                                 @Param("statuses") Collection<TripStatus> statuses,
                                 @Param("start") Instant start,
                                 @Param("end") Instant end);

    @Query("""
            select count(t) > 0 from Trip t
            where t.driverId = :driverId
              and t.id <> :excludedTripId
              and t.status in :statuses
              and t.scheduledStart < :end
              and t.scheduledEnd > :start
            """)
    boolean existsDriverOverlap(@Param("driverId") UUID driverId,
                                @Param("excludedTripId") UUID excludedTripId,
                                @Param("statuses") Collection<TripStatus> statuses,
                                @Param("start") Instant start,
                                @Param("end") Instant end);

    @Query("select t.status as status, count(t) as count from Trip t group by t.status")
    List<StatusCount> countByStatus();

    @Query("""
            select coalesce(sum(t.distanceKm), 0) as distanceKm,
                   coalesce(sum(coalesce(t.costs.baseRate, 0) + coalesce(t.costs.fuelCost, 0)
                                + coalesce(t.costs.additionalFees, 0)), 0) as revenue
            from Trip t
            where t.status = com.pcd.tripsservice.domain.TripStatus.COMPLETED
            """)
    CompletedTotals completedTotals();

    interface StatusCount {
        TripStatus getStatus();

        long getCount();
    }

    interface CompletedTotals {
        BigDecimal getDistanceKm();

        BigDecimal getRevenue();
    }
}
