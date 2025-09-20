package com.pcd.userservice.Entity.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pcd.userservice.Entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto implements Serializable {
    @NotNull @Size(min = 2, max = 30, message = "First name must be between 2 and 30 characters")
    private String firstName;

    @NotNull @Size(min = 2, max = 30, message = "Last name must be between 2 and 30 characters")
    private String lastName;

    @NotNull @Email(message = "Email should be valid")
    private String email;
    @NotNull
    private String phoneNumber;

    @NotNull
    private String licenseNumber;


    public User toUser() {
        return User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .licenseNumber(licenseNumber)
                .phoneNumber(phoneNumber)
                .createdAt(java.time.LocalDateTime.now())
                .updatedAt(java.time.LocalDateTime.now())
                .build();
    }
    public UserDto fromUser(User user) {
        return new UserDto(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getLicenseNumber()
                );
    }
}