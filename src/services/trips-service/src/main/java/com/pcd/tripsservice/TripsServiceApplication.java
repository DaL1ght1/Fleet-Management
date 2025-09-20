package com.pcd.tripsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.pcd.tripsservice", "com.pcd.shared"})
public class TripsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TripsServiceApplication.class, args);
	}

}
