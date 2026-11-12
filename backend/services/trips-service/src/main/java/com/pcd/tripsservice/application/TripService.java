package com.pcd.tripsservice.application;

import com.pcd.shared.error.ConflictException;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import com.pcd.tripsservice.domain.FleetResourceKind;
import com.pcd.tripsservice.domain.Trip;
import com.pcd.tripsservice.domain.TripPlan;
import com.pcd.tripsservice.domain.TripStatus;
import com.pcd.tripsservice.infrastructure.persistence.TripRepository;
import com.pcd.tripsservice.infrastructure.persistence.TripSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private static final UUID NO_TRIP = new UUID(0, 0);
    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "scheduledStart");

    private final TripRepository trips;
    private final FleetAvailabilityService fleetAvailability;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Optional<Trip> find(UUID id) {
        return trips.findById(id);
    }

    @Transactional(readOnly = true)
    public Page<Trip> search(TripCriteria criteria, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), DEFAULT_SORT);
        return trips.findAll(TripSpecifications.matching(criteria), pageRequest);
    }

    @Transactional(readOnly = true)
    public TripStatistics statistics() {
        Map<TripStatus, Long> counts = new EnumMap<>(TripStatus.class);
        trips.countByStatus().forEach(row -> counts.put(row.getStatus(), row.getCount()));
        TripRepository.CompletedTotals totals = trips.completedTotals();
        return new TripStatistics(counts, totals.getDistanceKm(), totals.getRevenue());
    }

    @Transactional(readOnly = true)
    public Page<Trip> involving(UUID accountId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), DEFAULT_SORT);
        return trips.findAll(TripSpecifications.involving(fleetAvailability.driversOf(accountId),
                fleetAvailability.customersOf(accountId)), pageRequest);
    }

    public Trip schedule(TripPlan plan) {
        ensureResourcesAvailable(plan, NO_TRIP);
        Trip trip = trips.save(Trip.schedule(plan));
        publish(TripEvent.Type.TRIP_SCHEDULED, trip);
        return trip;
    }

    public Trip reschedule(UUID id, TripPlanChanges changes) {
        Trip trip = load(id);
        TripPlan plan = changes.applyTo(trip.plan());
        ensureResourcesAvailable(plan, id);
        trip.reschedule(plan);
        publish(TripEvent.Type.TRIP_RESCHEDULED, trip);
        return trip;
    }

    public Trip start(UUID id) {
        Trip trip = load(id);
        trip.start(clock.instant());
        publish(TripEvent.Type.TRIP_STARTED, trip);
        return trip;
    }

    public Trip complete(UUID id, TripCompletion completion) {
        Trip trip = load(id);
        trip.complete(clock.instant(), completion.distanceKm(), completion.fuelCost(), completion.additionalFees());
        publish(TripEvent.Type.TRIP_COMPLETED, trip);
        return trip;
    }

    public Trip cancel(UUID id, String reason) {
        Trip trip = load(id);
        trip.cancel(reason);
        publish(TripEvent.Type.TRIP_CANCELLED, trip);
        return trip;
    }

    public void delete(UUID id) {
        Trip trip = load(id);
        trip.ensureDeletable();
        trips.delete(trip);
        publish(TripEvent.Type.TRIP_DELETED, trip);
    }

    private Trip load(UUID id) {
        return trips.findById(id).orElseThrow(() -> new NotFoundException("Trip", id));
    }

    private void ensureResourcesAvailable(TripPlan plan, UUID tripId) {
        if (plan.customerId() != null) {
            fleetAvailability.requireKnownCustomer(plan.customerId());
        }
        fleetAvailability.requireAssignable(FleetResourceKind.VEHICLE, plan.vehicleId());
        if (trips.existsVehicleOverlap(plan.vehicleId(), tripId, TripStatus.ACTIVE,
                plan.scheduledStart(), plan.scheduledEnd())) {
            throw new ConflictException("Vehicle %s already has a trip in this period".formatted(plan.vehicleId()));
        }
        if (plan.driverId() == null) {
            return;
        }
        fleetAvailability.requireAssignable(FleetResourceKind.DRIVER, plan.driverId());
        if (trips.existsDriverOverlap(plan.driverId(), tripId, TripStatus.ACTIVE,
                plan.scheduledStart(), plan.scheduledEnd())) {
            throw new ConflictException("Driver %s already has a trip in this period".formatted(plan.driverId()));
        }
    }

    private void publish(TripEvent.Type type, Trip trip) {
        events.publish(Topics.TRIP_EVENTS, trip.getId().toString(), TripEvents.of(type, trip, clock.instant()));
    }
}
