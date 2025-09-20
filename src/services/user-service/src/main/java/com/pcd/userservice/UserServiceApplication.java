package com.pcd.userservice;


import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;



@SpringBootApplication(scanBasePackages = {"com.pcd.userservice", "com.pcd.shared"})
@EnableJpaAuditing
@RequiredArgsConstructor
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }





}
