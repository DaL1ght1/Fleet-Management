package com.pcd.tripsservice.application;

import com.pcd.shared.error.BusinessRuleViolationException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static com.pcd.tripsservice.domain.TripFixtures.plan;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    private static final Instant NOW = Instant.parse("2030-01-01T09:00:00Z");

    @Mock
    private TripRepository trips;
    @Mock
    private FleetAvailabilityService fleetAvailability;
    @Mock
    private DomainEventPublisher events;

    private TripService service;
    private final UUID vehicleId = UUID.randomUUID();
    private final UUID driverId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new TripService(trips, fleetAvailability, events, Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void schedulingPersistsTheTripAndPublishesAnEvent() {
        given(trips.save(any(Trip.class))).willAnswer(invocation -> invocation.getArgument(0));

        Trip trip = service.schedule(plan(vehicleId, driverId));

        ArgumentCaptor<TripEvent> event = ArgumentCaptor.forClass(TripEvent.class);
        verify(events).publish(eq(Topics.TRIP_EVENTS), eq(trip.getId().toString()), event.capture());
        assertThat(event.getValue().type()).isEqualTo(TripEvent.Type.TRIP_SCHEDULED);
        assertThat(event.getValue().vehicleId()).isEqualTo(vehicleId);
        assertThat(event.getValue().occurredAt()).isEqualTo(NOW);
    }

    @Test
    void schedulingFailsWhenTheVehicleIsAlreadyBooked() {
        TripPlan plan = plan(vehicleId, driverId);
        given(trips.existsVehicleOverlap(eq(vehicleId), any(), eq(TripStatus.ACTIVE), any(), any())).willReturn(true);

        assertThatThrownBy(() -> service.schedule(plan)).isInstanceOf(ConflictException.class);
        verify(trips, never()).save(any());
    }

    @Test
    void schedulingFailsWhenTheDriverIsNotAssignable() {
        willDoNothing().given(fleetAvailability).requireAssignable(FleetResourceKind.VEHICLE, vehicleId);
        willThrow(new BusinessRuleViolationException("Driver is SUSPENDED"))
                .given(fleetAvailability).requireAssignable(FleetResourceKind.DRIVER, driverId);

        assertThatThrownBy(() -> service.schedule(plan(vehicleId, driverId)))
                .isInstanceOf(BusinessRuleViolationException.class);
        verify(events, never()).publish(any(), any(), any());
    }

    @Test
    void startingATripUsesTheClockAndPublishesAnEvent() {
        Trip trip = Trip.schedule(plan(vehicleId, driverId));
        given(trips.findById(trip.getId())).willReturn(Optional.of(trip));

        service.start(trip.getId());

        assertThat(trip.getStartedAt()).isEqualTo(NOW);
        verify(events).publish(eq(Topics.TRIP_EVENTS), eq(trip.getId().toString()), any(TripEvent.class));
    }

    @Test
    void operatingOnAnUnknownTripFails() {
        UUID unknown = UUID.randomUUID();
        given(trips.findById(unknown)).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancel(unknown, "reason")).isInstanceOf(NotFoundException.class);
    }
}
