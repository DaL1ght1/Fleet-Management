package com.pcd.userservice.application;

import java.math.BigDecimal;
import com.pcd.userservice.domain.DriverProfile;
import com.pcd.userservice.domain.EmergencyContact;

import java.time.LocalDate;
import java.util.UUID;

public record DriverRegistration(
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

    DriverProfile toProfile(LocalDate today) {
        return new DriverProfile(accountId, firstName, lastName, email, phoneNumber, licenseNumber, licenseExpiryDate,
                dateOfBirth, hireDate != null ? hireDate : today, emergencyContact, monthlySalary);
    }
}
