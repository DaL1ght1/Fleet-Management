package com.pcd.userservice.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Validated
@Builder
@Table(name = "drivers")
@EntityListeners(AuditingEntityListener.class)
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Size(min = 2, max = 30, message = "First name must be between 2 and 30 characters")
    @Column(nullable = false)
    private String firstName;

    @Size(min = 2, max = 30, message = "Last name must be between 2 and 30 characters")
    @Column(nullable = false)
    private String lastName;

    @Email(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

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

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum DriverStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        ON_LEAVE
    }
}