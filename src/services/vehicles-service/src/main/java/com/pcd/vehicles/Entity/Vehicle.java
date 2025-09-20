package com.pcd.vehicles.Entity;


import com.pcd.vehicles.Entity.Enum.FuelType;
import com.pcd.vehicles.Entity.Enum.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "vehicle")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false)
    private String make;
    @Column(nullable = false)
    private String model;
    @Column(nullable = false)
    private int year;
    @Column(nullable = false, unique = true)
    private String licensePlate;
    @Column(nullable = false)
    private Status status;
    @Column(nullable = false,unique = true)
    private String vin;
    @Column(nullable = false)
    private String color;
    @Column(nullable = false)
    private Long mileage;
    @Column(nullable = false)
    private FuelType fuelType;
    @Column(nullable = false)
    private int seatingCapacity;
    @Column(nullable = false)
    private Long rentalPricePerDay;
    @Column(nullable = false)
    private boolean gpsEnabled;
    @Column(nullable = false)
    private LocalDate lastMaintenanceDate;
    @Column(nullable = false)
    private int maintenanceIntervalDays;
    @Column(nullable = true)
    private LocalDate nextMaintenanceDate;



}
