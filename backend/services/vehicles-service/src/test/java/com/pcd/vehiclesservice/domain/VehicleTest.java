package com.pcd.vehiclesservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VehicleTest {

    static VehicleSpecification specification() {
        return new VehicleSpecification("Toyota", "Corolla", 2022, " 123 tu  4567 ", "jtdbr32e540012345", "White",
                15_000, FuelType.HYBRID, 5, new BigDecimal("95.00"), true, LocalDate.of(2026, 1, 10), 180);
    }

    private final Vehicle vehicle = Vehicle.register(specification());

    @Test
    void registrationNormalizesIdentifiersAndStartsActive() {
        assertThat(vehicle.getLicensePlate()).isEqualTo("123 TU 4567");
        assertThat(vehicle.getVin()).isEqualTo("JTDBR32E540012345");
        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.ACTIVE);
        assertThat(vehicle.getNextMaintenanceDate()).isEqualTo(LocalDate.of(2026, 7, 9));
    }

    @Test
    void invalidVinsAreRejected() {
        assertThatThrownBy(() -> new VehicleSpecification("Toyota", "Corolla", 2022, "1", "IOQ", "White", 0,
                FuelType.DIESEL, 5, BigDecimal.ONE, false, LocalDate.now(), 30))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("vin");
    }

    @Test
    void odometerReadingsCannotGoBackwards() {
        vehicle.recordOdometerReading(16_000);

        assertThat(vehicle.getMileage()).isEqualTo(16_000);
        assertThatThrownBy(() -> vehicle.recordOdometerReading(15_999))
                .isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void completingMaintenanceReactivatesTheVehicle() {
        vehicle.changeStatus(VehicleStatus.MAINTENANCE);

        vehicle.completeMaintenance(LocalDate.of(2026, 6, 1));

        assertThat(vehicle.getStatus()).isEqualTo(VehicleStatus.ACTIVE);
        assertThat(vehicle.isMaintenanceDue(LocalDate.of(2026, 6, 2))).isFalse();
        assertThat(vehicle.isMaintenanceDue(LocalDate.of(2026, 11, 28))).isTrue();
    }

    @Test
    void aVehicleOnATripCannotBeTakenOutOfServiceOrDeleted() {
        UUID tripId = UUID.randomUUID();
        vehicle.startTrip(tripId);

        assertThatThrownBy(() -> vehicle.changeStatus(VehicleStatus.MAINTENANCE))
                .isInstanceOf(BusinessRuleViolationException.class);
        assertThatThrownBy(vehicle::ensureDeletable).isInstanceOf(BusinessRuleViolationException.class);

        vehicle.finishTrip(tripId);

        assertThat(vehicle.isInUse()).isFalse();
        vehicle.ensureDeletable();
    }

    @Test
    void finishingAnotherTripDoesNotReleaseTheVehicle() {
        UUID tripId = UUID.randomUUID();
        vehicle.startTrip(tripId);

        vehicle.finishTrip(UUID.randomUUID());

        assertThat(vehicle.getCurrentTripId()).isEqualTo(tripId);
    }

    @Test
    void partialUpdatesKeepUnchangedFields() {
        vehicle.update(new VehicleChanges(null, null, null, null, "Black", null, null, null, null, null));

        assertThat(vehicle.getColor()).isEqualTo("Black");
        assertThat(vehicle.getMake()).isEqualTo("Toyota");
    }
}
