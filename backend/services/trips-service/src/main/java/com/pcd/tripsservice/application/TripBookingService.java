package com.pcd.tripsservice.application;

import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.error.ConflictException;
import com.pcd.tripsservice.domain.FleetResource;
import com.pcd.tripsservice.domain.FleetResourceKind;
import com.pcd.tripsservice.domain.Location;
import com.pcd.tripsservice.domain.Trip;
import com.pcd.tripsservice.domain.TripCosts;
import com.pcd.tripsservice.domain.TripPlan;
import com.pcd.tripsservice.domain.TripStatus;
import com.pcd.tripsservice.domain.TripType;
import com.pcd.tripsservice.infrastructure.persistence.FleetResourceRepository;
import com.pcd.tripsservice.infrastructure.persistence.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TripBookingService {

    private static final UUID NO_TRIP = new UUID(0, 0);
    private static final double EARTH_RADIUS_KM = 6371.0088;
    private static final int MINIMUM_DURATION_MINUTES = 10;
    private static final Duration LATE_TOLERANCE = Duration.ofMinutes(5);

    private final TripService trips;
    private final TripRepository tripRepository;
    private final FleetResourceRepository resources;
    private final FleetAvailabilityService fleetAvailability;
    private final BookingProperties properties;
    private final Clock clock;

    @Transactional(readOnly = true)
    public TripQuote quote(TripRequest request) {
        Estimate estimate = estimate(request);
        boolean available = request.vehicleId() != null
                || firstAvailable(FleetResourceKind.VEHICLE, estimate.departAt(), estimate.releaseAt()).isPresent();
        return new TripQuote(estimate.distanceKm(), estimate.durationMinutes(), estimate.departAt(),
                estimate.arriveAt(), estimate.price(), available);
    }

    public Trip book(TripRequest request) {
        Estimate estimate = estimate(request);
        UUID vehicleId = Optional.ofNullable(request.vehicleId())
                .or(() -> firstAvailable(FleetResourceKind.VEHICLE, estimate.departAt(), estimate.releaseAt()))
                .orElseThrow(() -> new ConflictException("No vehicle is available for this departure time"));
        UUID driverId = Optional.ofNullable(request.driverId())
                .or(() -> firstAvailable(FleetResourceKind.DRIVER, estimate.departAt(), estimate.releaseAt()))
                .orElse(null);
        return trips.schedule(new TripPlan(
                request.type() == null ? TripType.RENTAL : request.type(),
                vehicleId,
                driverId,
                request.customerId(),
                request.from(),
                request.to(),
                List.of(),
                estimate.departAt(),
                estimate.releaseAt(),
                estimate.durationMinutes(),
                new TripCosts(estimate.price(), null, null),
                request.notes(),
                null,
                null));
    }

    @Transactional(readOnly = true)
    public UUID customerFor(UUID accountId) {
        return fleetAvailability.customersOf(accountId).stream().findFirst()
                .orElseThrow(() -> new BusinessRuleViolationException(
                        "Your customer profile is not ready yet. Sign in again in a moment."));
    }

    private Optional<UUID> firstAvailable(FleetResourceKind kind, Instant start, Instant end) {
        return resources.findByKindAndAssignableTrueOrderByDisplayNameAsc(kind).stream()
                .map(FleetResource::getId)
                .filter(id -> kind == FleetResourceKind.VEHICLE
                        ? !tripRepository.existsVehicleOverlap(id, NO_TRIP, TripStatus.ACTIVE, start, end)
                        : !tripRepository.existsDriverOverlap(id, NO_TRIP, TripStatus.ACTIVE, start, end))
                .findFirst();
    }

    private Estimate estimate(TripRequest request) {
        Instant now = clock.instant().truncatedTo(ChronoUnit.MINUTES);
        Instant departAt = request.departAt() == null ? now : request.departAt().truncatedTo(ChronoUnit.MINUTES);
        if (departAt.isBefore(now.minus(LATE_TOLERANCE))) {
            throw new BusinessRuleViolationException("The departure time must be in the future");
        }
        BigDecimal distanceKm = request.routeDistanceKm() != null && request.routeDistanceKm().signum() > 0
                ? request.routeDistanceKm()
                : BigDecimal.valueOf(greatCircleKm(request.from(), request.to()) * properties.roadFactor());
        distanceKm = distanceKm.setScale(1, RoundingMode.HALF_UP);
        int durationMinutes = Math.max(MINIMUM_DURATION_MINUTES, request.routeDurationMinutes() != null
                && request.routeDurationMinutes() > 0
                ? request.routeDurationMinutes()
                : (int) Math.ceil(distanceKm.doubleValue() / properties.averageSpeedKph() * 60));
        Instant arriveAt = departAt.plus(Duration.ofMinutes(durationMinutes));
        BigDecimal price = properties.baseFare()
                .add(properties.pricePerKm().multiply(distanceKm))
                .setScale(3, RoundingMode.HALF_UP);
        return new Estimate(distanceKm, durationMinutes, departAt, arriveAt,
                arriveAt.plus(Duration.ofMinutes(properties.handoverMinutes())), price);
    }

    static double greatCircleKm(Location from, Location to) {
        double latitudeDelta = Math.toRadians(to.latitude() - from.latitude());
        double longitudeDelta = Math.toRadians(to.longitude() - from.longitude());
        double a = Math.pow(Math.sin(latitudeDelta / 2), 2) + Math.cos(Math.toRadians(from.latitude()))
                * Math.cos(Math.toRadians(to.latitude())) * Math.pow(Math.sin(longitudeDelta / 2), 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }

    private record Estimate(BigDecimal distanceKm, int durationMinutes, Instant departAt, Instant arriveAt,
                            Instant releaseAt, BigDecimal price) {
    }
}
