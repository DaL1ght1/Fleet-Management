package com.pcd.userservice;

import com.pcd.userservice.Entity.User;
import com.pcd.userservice.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static com.pcd.userservice.Entity.Role.ADMIN;

@SpringBootApplication
@EnableJpaAuditing
@RequiredArgsConstructor
public class UserServiceApplication {

    private final UserRepository userRepository;
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    // Code to run once at startup: create the admin if it doesn't already exist
    @Bean
    public CommandLineRunner addAdmin(PasswordEncoder encoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@admin.com")) {
                userRepository.save(User.builder()
                        .email("admin@admin.com")
                        .firstName("Admin")
                        .lastName("Admin")
                        .password(encoder.encode("admin"))
                        .role(ADMIN)
                        .enabled(true)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .phoneNumber("0000000000")
                        .build());
            }
        };
    }


}
