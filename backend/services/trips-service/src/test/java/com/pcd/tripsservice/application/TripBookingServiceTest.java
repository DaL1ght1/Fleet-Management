package com.pcd.tripsservice.application;

import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.error.ConflictException;
import com.pcd.tripsservice.domain.FleetResource;
import com.pcd.tripsservice.domain.FleetResourceKind;
import com.pcd.tripsservice.domain.Trip;
import com.pcd.tripsservice.domain.TripPlan;
import com.pcd.tripsservice.domain.TripStatus;
import com.pcd.tripsservice.domain.TripType;
import com.pcd.tripsservice.infrastructure.persistence.FleetResourceRepository;
import com.pcd.tripsservice.infrastructure.persistence.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static com.pcd.tripsservice.domain.TripFixtures.DESTINATION;
import static com.pcd.tripsservice.domain.TripFixtures.ORIGIN;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TripBookingServiceTest {

    private static final Instant NOW = Instant.parse("2030-01-01T09:00:30Z");
    private static final BookingProperties PROPERTIES =
            new BookingProperties(new BigDecimal("8.000"), new BigDecimal("0.850"), 45, 1.3, 15);

    @Mock
    private TripRepository tripRepository;
    @Mock
    private FleetResourceRepository resources;
    @Mock
    private FleetAvailabilityService fleetAvailability;

    private TripService trips;
    private TripBookingService booking;

    @BeforeEach
    void setUp() {
        trips = mock(TripService.class);
        booking = new TripBookingService(trips, tripRepository, resources, fleetAvailability, PROPERTIES,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void quotesUseTheRouteWhenTheClientKnowsIt() {
        TripQuote quote = booking.quote(request(null, new BigDecimal("140.4"), 95));

        assertThat(quote.distanceKm()).isEqualByComparingTo("140.4");
        assertThat(quote.durationMinutes()).isEqualTo(95);
        assertThat(quote.departAt()).isEqualTo(Instant.parse("2030-01-01T09:00:00Z"));
        assertThat(quote.arriveAt()).isEqualTo(Instant.parse("2030-01-01T10:35:00Z"));
        assertThat(quote.price()).isEqualByComparingTo("127.340");
    }

    @Test
    void quotesFallBackToTheGreatCircleDistanceWithARoadFactor() {
        TripQuote quote = booking.quote(request(null, null, null));

        assertThat(quote.distanceKm().doubleValue()).isBetween(145.0, 160.0);
        assertThat(quote.durationMinutes()).isBetween(190, 215);
    }

    @Test
    void bookingPicksTheFirstVehicleAndDriverFreeForTheWholeTrip() {
        FleetResource busyVehicle = resource(FleetResourceKind.VEHICLE);
        FleetResource freeVehicle = resource(FleetResourceKind.VEHICLE);
        FleetResource driver = resource(FleetResourceKind.DRIVER);
        given(resources.findByKindAndAssignableTrueOrderByDisplayNameAsc(FleetResourceKind.VEHICLE))
                .willReturn(List.of(busyVehicle, freeVehicle));
        given(resources.findByKindAndAssignableTrueOrderByDisplayNameAsc(FleetResourceKind.DRIVER))
                .willReturn(List.of(driver));
        given(tripRepository.existsVehicleOverlap(eq(busyVehicle.getId()), any(), eq(TripStatus.ACTIVE), any(), any()))
                .willReturn(true);
        given(trips.schedule(any())).willAnswer(invocation -> Trip.schedule(invocation.getArgument(0)));

        booking.book(request(Instant.parse("2030-01-02T07:00:00Z"), new BigDecimal("140"), 90));

        ArgumentCaptor<TripPlan> plan = ArgumentCaptor.forClass(TripPlan.class);
        verify(trips).schedule(plan.capture());
        assertThat(plan.getValue().vehicleId()).isEqualTo(freeVehicle.getId());
        assertThat(plan.getValue().driverId()).isEqualTo(driver.getId());
        assertThat(plan.getValue().type()).isEqualTo(TripType.RENTAL);
        assertThat(plan.getValue().scheduledEnd()).isEqualTo(Instant.parse("2030-01-02T08:45:00Z"));
        assertThat(plan.getValue().costs().baseRate()).isEqualByComparingTo("127.000");
    }

    @Test
    void bookingFailsWhenNoVehicleIsFree() {
        given(resources.findByKindAndAssignableTrueOrderByDisplayNameAsc(FleetResourceKind.VEHICLE))
                .willReturn(List.of());

        assertThatThrownBy(() -> booking.book(request(null, null, null))).isInstanceOf(ConflictException.class);
    }

    @Test
    void departuresInThePastAreRejected() {
        assertThatThrownBy(() -> booking.quote(request(NOW.minusSeconds(3600), null, null)))
                .isInstanceOf(BusinessRuleViolationException.class);
    }

    private static TripRequest request(Instant departAt, BigDecimal distanceKm, Integer durationMinutes) {
        return new TripRequest(ORIGIN, DESTINATION, departAt, distanceKm, durationMinutes, null, null, null, null,
                null);
    }

    private static FleetResource resource(FleetResourceKind kind) {
        FleetResource resource = FleetResource.track(UUID.randomUUID(), kind);
        resource.apply(NOW, "resource", "ACTIVE", true, null);
        return resource;
    }
}
