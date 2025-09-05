package com.pcd.vehicles.Entity.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pcd.vehicles.Entity.Enum.FuelType;
import com.pcd.vehicles.Entity.Enum.Status;
import com.pcd.vehicles.Entity.Vehicle;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class VehicleInput implements Serializable {
    private String make;
    private String model;
    private int year;
    private String licensePlate;
    private Status status;
    private String vin;
    private String color;
    private Long mileage;
    private FuelType fuelType;
    private int seatingCapacity;
    private Long rentalPricePerDay;
    private boolean gpsEnabled;
    private LocalDate lastMaintenanceDate;
    private int maintenanceIntervalDays;
    private LocalDate nextMaintenanceDate;

    public Vehicle toVehicle() {
        return Vehicle.builder()
                .make(make)
                .model(model)
                .year(year)
                .licensePlate(licensePlate)
                .status(status)
                .vin(vin)
                .color(color)
                .mileage(mileage)
                .fuelType(fuelType)
                .seatingCapacity(seatingCapacity)
                .rentalPricePerDay(rentalPricePerDay)
                .gpsEnabled(gpsEnabled)
                .lastMaintenanceDate(lastMaintenanceDate)
                .maintenanceIntervalDays(maintenanceIntervalDays)
                .nextMaintenanceDate(nextMaintenanceDate)
                .build();
    }
    public VehicleInput fromVehicle(Vehicle vehicle) {
        return new VehicleInput(
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getLicensePlate(),
                vehicle.getStatus(),
                vehicle.getVin(),
                vehicle.getColor(),
                vehicle.getMileage(),
                vehicle.getFuelType(),
                vehicle.getSeatingCapacity(),
                vehicle.getRentalPricePerDay(),
                vehicle.isGpsEnabled(),
                vehicle.getLastMaintenanceDate(),
                vehicle.getMaintenanceIntervalDays(),
                vehicle.getNextMaintenanceDate()
        );
    }
}