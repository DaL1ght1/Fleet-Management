package com.pcd.userservice.Entity.DTO;

import com.pcd.shared.enums.DriverStatus;
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
    private DriverStatus status;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private UUID currentTripId;
    private BigDecimal rating;

    public Driver toDriver() {
        return new Driver(
                this.firstName,
                this.lastName,
                this.email,
                this.phone,
                this.licenseNumber,
                this.licenseExpiryDate,
                this.status != null ? this.status : DriverStatus.ACTIVE,
                this.dateOfBirth,
                this.hireDate,
                this.emergencyContactName,
                this.emergencyContactPhone,
                this.currentTripId,
                this.rating
        );
    }

    public static DriverDto fromDriver(Driver driver) {
        return DriverDto.builder()
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phone(driver.getPhoneNumber())
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