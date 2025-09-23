package com.pcd.userservice.Entity.DTO;

import com.pcd.userservice.Entity.Driver;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DriverDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private Driver.DriverStatus status;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private UUID currentTripId;
    private BigDecimal rating;

    public Driver toDriver() {
        return Driver.builder()
                .firstName(this.firstName)
                .lastName(this.lastName)
                .email(this.email)
                .phone(this.phone)
                .licenseNumber(this.licenseNumber)
                .licenseExpiryDate(this.licenseExpiryDate)
                .status(this.status != null ? this.status : Driver.DriverStatus.ACTIVE)
                .dateOfBirth(this.dateOfBirth)
                .hireDate(this.hireDate)
                .emergencyContactName(this.emergencyContactName)
                .emergencyContactPhone(this.emergencyContactPhone)
                .currentTripId(this.currentTripId)
                .rating(this.rating)
                .build();
    }

    public static DriverDto fromDriver(Driver driver) {
        return DriverDto.builder()
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .licenseNumber(driver.getLicenseNumber())
                .licenseExpiryDate(driver.getLicenseExpiryDate())
                .status(driver.getStatus())
                .dateOfBirth(driver.getDateOfBirth())
                .hireDate(driver.getHireDate())
                .emergencyContactName(driver.getEmergencyContactName())
                .emergencyContactPhone(driver.getEmergencyContactPhone())
                .currentTripId(driver.getCurrentTripId())
                .rating(driver.getRating())
                .build();
    }
}