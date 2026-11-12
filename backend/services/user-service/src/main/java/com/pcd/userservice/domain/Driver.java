package com.pcd.userservice.domain;

import java.math.BigDecimal;
import com.pcd.shared.error.BusinessRuleViolationException;
import jakarta.persistence.Embedded;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Driver {

    private static final int MIN_RATING = 1;
    private static final int MAX_RATING = 5;

    @Id
    private UUID id;

    @Version
    private long version;

    private UUID accountId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String licenseNumber;

    private LocalDate licenseExpiryDate;

    @Enumerated(EnumType.STRING)
    private DriverStatus status;

    private LocalDate dateOfBirth;

    private LocalDate hireDate;

    private BigDecimal monthlySalary;

    @Embedded
    private EmergencyContact emergencyContact;

    private UUID currentTripId;

    private int ratingTotal;

    private int ratingCount;

    private int completedTrips;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Driver register(DriverProfile profile) {
        Driver driver = new Driver();
        driver.id = UUID.randomUUID();
        driver.status = DriverStatus.ACTIVE;
        driver.apply(profile);
        return driver;
    }

    public DriverProfile profile() {
        return new DriverProfile(accountId, firstName, lastName, email, phoneNumber, licenseNumber,
                licenseExpiryDate, dateOfBirth, hireDate, emergencyContact, monthlySalary);
    }

    public void update(DriverProfile profile) {
        apply(profile);
    }

    public void linkAccount(UUID linkedAccountId) {
        accountId = linkedAccountId;
    }

    public boolean changeStatus(DriverStatus newStatus) {
        if (newStatus == status) {
            return false;
        }
        if (newStatus != DriverStatus.ACTIVE && isOnTrip()) {
            throw new BusinessRuleViolationException(
                    "Driver %s is on trip %s and cannot be set to %s".formatted(getFullName(), currentTripId, newStatus));
        }
        status = newStatus;
        return true;
    }

    public void rate(int rating) {
        if (rating < MIN_RATING || rating > MAX_RATING) {
            throw new IllegalArgumentException("rating must be between %d and %d".formatted(MIN_RATING, MAX_RATING));
        }
        ratingTotal += rating;
        ratingCount++;
    }

    public void startTrip(UUID tripId) {
        currentTripId = tripId;
    }

    public void completeTrip(UUID tripId) {
        if (tripId.equals(currentTripId)) {
            currentTripId = null;
            completedTrips++;
        }
    }

    public void releaseTrip(UUID tripId) {
        if (tripId.equals(currentTripId)) {
            currentTripId = null;
        }
    }

    public void ensureDeletable() {
        if (isOnTrip()) {
            throw new BusinessRuleViolationException(
                    "Driver %s is on trip %s and cannot be deleted".formatted(getFullName(), currentTripId));
        }
    }

    public boolean isOnTrip() {
        return currentTripId != null;
    }

    public boolean isAvailable(LocalDate today) {
        return status == DriverStatus.ACTIVE && !isOnTrip() && !isLicenseExpired(today);
    }

    public boolean isLicenseExpired(LocalDate today) {
        return licenseExpiryDate.isBefore(today);
    }

    public Double getRating() {
        return ratingCount == 0 ? null : (double) ratingTotal / ratingCount;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    private void apply(DriverProfile profile) {
        accountId = profile.accountId();
        firstName = profile.firstName();
        lastName = profile.lastName();
        email = profile.email();
        phoneNumber = profile.phoneNumber();
        licenseNumber = profile.licenseNumber();
        licenseExpiryDate = profile.licenseExpiryDate();
        dateOfBirth = profile.dateOfBirth();
        hireDate = profile.hireDate();
        emergencyContact = profile.emergencyContact();
        monthlySalary = profile.monthlySalary();
    }
}
