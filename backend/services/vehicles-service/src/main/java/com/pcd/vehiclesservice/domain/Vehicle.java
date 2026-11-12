package com.pcd.vehiclesservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Vehicle {

    @Id
    private UUID id;

    @Version
    private long version;

    private String make;

    private String model;

    private int year;

    private String licensePlate;

    private String vin;

    private String color;

    private long mileage;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    private int seatingCapacity;

    private BigDecimal dailyRate;

    private boolean gpsEnabled;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    private LocalDate lastMaintenanceDate;

    private int maintenanceIntervalDays;

    @Generated(event = {EventType.INSERT, EventType.UPDATE})
    @Column(insertable = false, updatable = false)
    private LocalDate nextMaintenanceDate;

    private UUID currentTripId;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Vehicle register(VehicleSpecification specification) {
        Vehicle vehicle = new Vehicle();
        vehicle.id = UUID.randomUUID();
        vehicle.status = VehicleStatus.ACTIVE;
        vehicle.vin = specification.vin();
        vehicle.mileage = specification.mileage();
        vehicle.lastMaintenanceDate = specification.lastMaintenanceDate();
        vehicle.apply(specification);
        return vehicle;
    }

    public VehicleSpecification specification() {
        return new VehicleSpecification(make, model, year, licensePlate, vin, color, mileage, fuelType,
                seatingCapacity, dailyRate, gpsEnabled, lastMaintenanceDate, maintenanceIntervalDays);
    }

    public void update(VehicleChanges changes) {
        apply(changes.applyTo(specification()));
    }

    public boolean changeStatus(VehicleStatus newStatus) {
        if (newStatus == status) {
            return false;
        }
        if (newStatus != VehicleStatus.ACTIVE && isInUse()) {
            throw new BusinessRuleViolationException(
                    "Vehicle %s is on trip %s and cannot be set to %s".formatted(licensePlate, currentTripId, newStatus));
        }
        status = newStatus;
        return true;
    }

    public boolean enterMaintenance() {
        if (isInUse() || status == VehicleStatus.MAINTENANCE) {
            return false;
        }
        status = VehicleStatus.MAINTENANCE;
        return true;
    }

    public void recordOdometerReading(long reading) {
        if (reading < mileage) {
            throw new BusinessRuleViolationException(
                    "Odometer reading %d is lower than the recorded mileage %d".formatted(reading, mileage));
        }
        mileage = reading;
    }

    public void completeMaintenance(LocalDate date) {
        if (date.isBefore(lastMaintenanceDate)) {
            throw new BusinessRuleViolationException("Maintenance date cannot be before the previous maintenance");
        }
        lastMaintenanceDate = date;
        if (status == VehicleStatus.MAINTENANCE) {
            status = VehicleStatus.ACTIVE;
        }
    }

    public void startTrip(UUID tripId) {
        currentTripId = tripId;
    }

    public void finishTrip(UUID tripId) {
        if (tripId.equals(currentTripId)) {
            currentTripId = null;
        }
    }

    public void ensureDeletable() {
        if (isInUse()) {
            throw new BusinessRuleViolationException(
                    "Vehicle %s is on trip %s and cannot be deleted".formatted(licensePlate, currentTripId));
        }
    }

    public boolean isInUse() {
        return currentTripId != null;
    }

    public LocalDate getNextMaintenanceDate() {
        return lastMaintenanceDate.plusDays(maintenanceIntervalDays);
    }

    public boolean isMaintenanceDue(LocalDate today) {
        return !getNextMaintenanceDate().isAfter(today);
    }

    private void apply(VehicleSpecification specification) {
        make = specification.make();
        model = specification.model();
        year = specification.year();
        licensePlate = specification.licensePlate();
        color = specification.color();
        fuelType = specification.fuelType();
        seatingCapacity = specification.seatingCapacity();
        dailyRate = specification.dailyRate();
        gpsEnabled = specification.gpsEnabled();
        maintenanceIntervalDays = specification.maintenanceIntervalDays();
    }
}
