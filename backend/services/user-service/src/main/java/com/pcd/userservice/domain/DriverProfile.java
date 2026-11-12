package com.pcd.userservice.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

public record DriverProfile(
        UUID accountId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String licenseNumber,
        LocalDate licenseExpiryDate,
        LocalDate dateOfBirth,
        LocalDate hireDate,
        EmergencyContact emergencyContact,
        BigDecimal monthlySalary) {

    private static final int MINIMUM_DRIVING_AGE = 18;

    public DriverProfile {
        firstName = ContactRules.name(firstName, "firstName");
        lastName = ContactRules.name(lastName, "lastName");
        email = ContactRules.email(email);
        phoneNumber = ContactRules.phone(phoneNumber, true);
        licenseNumber = ContactRules.name(licenseNumber, "licenseNumber").toUpperCase(Locale.ROOT);
        Objects.requireNonNull(licenseExpiryDate, "licenseExpiryDate is required");
        Objects.requireNonNull(hireDate, "hireDate is required");
        if (monthlySalary != null && monthlySalary.signum() < 0) {
            throw new IllegalArgumentException("monthlySalary must not be negative");
        }
        if (dateOfBirth != null && Period.between(dateOfBirth, hireDate).getYears() < MINIMUM_DRIVING_AGE) {
            throw new IllegalArgumentException("Drivers must be at least %d years old when hired"
                    .formatted(MINIMUM_DRIVING_AGE));
        }
    }
}
