package com.pcd.userservice.Entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import org.springframework.validation.annotation.Validated;
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
@Table(name = "customer")
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id ;
    @Size(min = 2, max = 30, message = "First name must be between 2 and 30 characters")
    private String firstName ;
    @Size(min = 2, max = 30, message = "Last name must be between 2 and 30 characters")
    private String lastName;
    @Email(message = "Email should be valid")
    private String email ;
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String licenseNumber;
    private String phoneNumber;
    @CreatedDate
    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate
    @Column(name = "last_modified_date", nullable = false)
    private LocalDateTime updatedAt;

}
