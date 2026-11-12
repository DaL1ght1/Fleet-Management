package com.pcd.tripsservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

import static com.pcd.tripsservice.domain.TripFixtures.START;
import static com.pcd.tripsservice.domain.TripFixtures.plan;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TripTest {

    private final Trip trip = Trip.schedule(plan(UUID.randomUUID(), UUID.randomUUID()));

    @Test
    void newTripsAreScheduled() {
        assertThat(trip.getStatus()).isEqualTo(TripStatus.SCHEDULED);
        assertThat(trip.getId()).isNotNull();
        assertThat(trip.isActive()).isTrue();
    }

    @Test
    void completingATripRecordsActualsAndDuration() {
        trip.start(START);
        trip.complete(START.plus(Duration.ofMinutes(170)), new BigDecimal("140.5"), new BigDecimal("35"), null);

        assertThat(trip.getStatus()).isEqualTo(TripStatus.COMPLETED);
        assertThat(trip.getDistanceKm()).isEqualByComparingTo("140.5");
        assertThat(trip.actualDurationMinutes()).contains(170);
        assertThat(trip.getCosts().total()).isEqualByComparingTo("155");
        assertThat(trip.isActive()).isFalse();
    }

    @Test
    void aScheduledTripCannotBeCompleted() {
        assertThatThrownBy(() -> trip.complete(START, BigDecimal.ONE, null, null))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("SCHEDULED");
    }

    @Test
    void aStartedTripCannotBeRescheduled() {
        trip.start(START);

        assertThatThrownBy(() -> trip.reschedule(trip.plan()))
                .isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void aCompletedTripCannotBeCancelled() {
        trip.start(START);
        trip.complete(START.plusSeconds(60), BigDecimal.TEN, null, null);

        assertThatThrownBy(() -> trip.cancel("customer request"))
                .isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void cancellingRequiresAReason() {
        assertThatThrownBy(() -> trip.cancel(" "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void anInProgressTripCannotBeDeleted() {
        trip.start(START);

        assertThatThrownBy(trip::ensureDeletable).isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void plansMustEndAfterTheyStart() {
        assertThatThrownBy(() -> plan(UUID.randomUUID(), null, START, START))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("scheduledEnd");
    }

    @Test
    void negativeCostsAreRejected() {
        assertThatThrownBy(() -> new TripCosts(new BigDecimal("-1"), null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
