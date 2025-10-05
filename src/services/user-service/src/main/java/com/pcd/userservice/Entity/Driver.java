package com.pcd.userservice.Entity;

import com.pcd.shared.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString(callSuper = true)
@Validated
@Table(name = "drivers")
public class Driver extends User {

    @Column(unique = true)
    private String licenseNumber;

    private LocalDate licenseExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status = DriverStatus.ACTIVE;

    private LocalDate dateOfBirth;

    private LocalDate hireDate;

    private String emergencyContactName;

    private String emergencyContactPhone;

    // Current trip assignment (nullable)
    private UUID currentTripId;

    // Driver rating (0.0 to 5.0)
    @Column(precision = 2, scale = 1)
    private BigDecimal rating;
    
    // createdAt and updatedAt inherited from User
    
    // Custom constructor for creating a Driver
    public Driver(String firstName, String lastName, String email, String phoneNumber, 
                 String licenseNumber, LocalDate licenseExpiryDate, DriverStatus status, 
                 LocalDate dateOfBirth, LocalDate hireDate, String emergencyContactName, 
                 String emergencyContactPhone, UUID currentTripId, BigDecimal rating) {
        super(firstName, lastName, email, phoneNumber);
        this.licenseNumber = licenseNumber;
        this.licenseExpiryDate = licenseExpiryDate;
        this.status = status != null ? status : DriverStatus.ACTIVE;
        this.dateOfBirth = dateOfBirth;
        this.hireDate = hireDate;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.currentTripId = currentTripId;
        this.rating = rating;
    }

}
