package com.pcd.userservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DriverTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 11);

    static DriverProfile profile() {
        return new DriverProfile(null, " Amine ", "Ben Salah", "Amine.BenSalah@Example.com", "+216 20 123 456",
                "tn-123456", TODAY.plusYears(2), LocalDate.of(1990, 5, 1), TODAY.minusYears(1),
                new EmergencyContact("Sarra Ben Salah", "+216 98 765 432"), null);
    }

    private final Driver driver = Driver.register(profile());

    @Test
    void registrationNormalizesContactDetails() {
        assertThat(driver.getFirstName()).isEqualTo("Amine");
        assertThat(driver.getEmail()).isEqualTo("amine.bensalah@example.com");
        assertThat(driver.getLicenseNumber()).isEqualTo("TN-123456");
        assertThat(driver.getStatus()).isEqualTo(DriverStatus.ACTIVE);
        assertThat(driver.isAvailable(TODAY)).isTrue();
    }

    @Test
    void underageDriversAreRejected() {
        assertThatThrownBy(() -> new DriverProfile(null, "Young", "Driver", "young@example.com", "+21620000000",
                "TN-1", TODAY.plusYears(1), TODAY.minusYears(17), TODAY, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("18");
    }

    @Test
    void driversWithExpiredLicensesAreNotAvailable() {
        assertThat(driver.isAvailable(TODAY.plusYears(3))).isFalse();
        assertThat(driver.isLicenseExpired(TODAY.plusYears(3))).isTrue();
    }

    @Test
    void ratingsAreAveraged() {
        driver.rate(5);
        driver.rate(4);

        assertThat(driver.getRating()).isEqualTo(4.5);
        assertThat(driver.getRatingCount()).isEqualTo(2);
        assertThatThrownBy(() -> driver.rate(6)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void completedTripsAreCountedOnceEvenWhenEventsAreRedelivered() {
        UUID tripId = UUID.randomUUID();
        driver.startTrip(tripId);

        driver.completeTrip(tripId);
        driver.completeTrip(tripId);

        assertThat(driver.getCompletedTrips()).isEqualTo(1);
        assertThat(driver.isOnTrip()).isFalse();
    }

    @Test
    void aDriverOnATripCannotBeSuspendedOrDeleted() {
        driver.startTrip(UUID.randomUUID());

        assertThatThrownBy(() -> driver.changeStatus(DriverStatus.SUSPENDED))
                .isInstanceOf(BusinessRuleViolationException.class);
        assertThatThrownBy(driver::ensureDeletable).isInstanceOf(BusinessRuleViolationException.class);
    }
}
