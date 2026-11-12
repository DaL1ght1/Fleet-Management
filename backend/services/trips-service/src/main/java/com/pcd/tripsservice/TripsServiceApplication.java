package com.pcd.tripsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TripsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripsServiceApplication.class, args);
    }
}
