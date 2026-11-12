package com.pcd.userservice.application;

import java.math.BigDecimal;
import com.pcd.userservice.domain.DriverProfile;
import com.pcd.userservice.domain.EmergencyContact;

import java.time.LocalDate;
import java.util.UUID;

public record DriverProfileChanges(
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

    DriverProfile applyTo(DriverProfile current) {
        return new DriverProfile(
                valueOr(accountId, current.accountId()),
                valueOr(firstName, current.firstName()),
                valueOr(lastName, current.lastName()),
                valueOr(email, current.email()),
                valueOr(phoneNumber, current.phoneNumber()),
                valueOr(licenseNumber, current.licenseNumber()),
                valueOr(licenseExpiryDate, current.licenseExpiryDate()),
                valueOr(dateOfBirth, current.dateOfBirth()),
                valueOr(hireDate, current.hireDate()),
                valueOr(emergencyContact, current.emergencyContact()),
                valueOr(monthlySalary, current.monthlySalary()));
    }

    private static <T> T valueOr(T candidate, T fallback) {
        return candidate != null ? candidate : fallback;
    }
}
