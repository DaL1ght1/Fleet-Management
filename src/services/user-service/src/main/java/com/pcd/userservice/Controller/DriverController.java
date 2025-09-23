package com.pcd.userservice.Controller;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.userservice.Entity.Driver;
import com.pcd.userservice.Entity.DTO.DriverDto;
import com.pcd.userservice.Service.DriverService;
import com.pcd.userservice.Service.Interface.DriverServiceInt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class DriverController {

    private final DriverService driverService;

    @DgsQuery
    public List<Driver> drivers() {
        log.info("Fetching all drivers");
        return driverService.getAllDrivers();
    }

    @DgsQuery
    public Driver getDriverById(@InputArgument UUID id) {
        log.info("Fetching driver with id: {}", id);
        return driverService.getDriverById(id);
    }

    @DgsQuery
    public Driver getDriverByEmail(@InputArgument String email) {
        log.info("Fetching driver with email: {}", email);
        return driverService.getDriverByEmail(email);
    }

    @DgsQuery
    public List<Driver> getDriversByStatus(@InputArgument String status) {
        log.info("Fetching drivers with status: {}", status);
        Driver.DriverStatus driverStatus = Driver.DriverStatus.valueOf(status.toUpperCase());
        return driverService.getDriversByStatus(driverStatus);
    }

    @DgsQuery
    public List<Driver> getAvailableDrivers() {
        log.info("Fetching available drivers");
        return driverService.getAvailableDrivers();
    }

    @DgsQuery
    public List<Driver> getBusyDrivers() {
        log.info("Fetching busy drivers");
        return driverService.getBusyDrivers();
    }

    @DgsQuery
    public List<Driver> searchDriversByName(@InputArgument String name) {
        log.info("Searching drivers by name: {}", name);
        return driverService.searchDriversByName(name);
    }

    @DgsQuery
    public DriverServiceInt.DriverStatistics getDriverStatistics() {
        log.info("Fetching driver statistics");
        return driverService.getDriverStatistics();
    }

    @DgsMutation
    public Driver createDriver(@InputArgument("input") DriverDto input) {
        log.info("Creating driver with email: {}", input.getEmail());
        return driverService.createDriver(input);
    }

    @DgsMutation
    public Driver updateDriver(@InputArgument UUID id, @InputArgument("input") DriverDto input) {
        log.info("Updating driver with id: {}", id);
        return driverService.updateDriver(id, input);
    }

    @DgsMutation
    public Boolean deleteDriver(@InputArgument UUID id) {
        log.info("Deleting driver with id: {}", id);
        return driverService.deleteDriver(id);
    }

    @DgsMutation
    public Driver assignDriverToTrip(@InputArgument UUID driverId, @InputArgument UUID tripId) {
        log.info("Assigning driver {} to trip {}", driverId, tripId);
        return driverService.assignDriverToTrip(driverId, tripId);
    }

    @DgsMutation
    public Driver unassignDriverFromTrip(@InputArgument UUID driverId) {
        log.info("Unassigning driver {} from trip", driverId);
        return driverService.unassignDriverFromTrip(driverId);
    }

    @DgsMutation
    public Driver updateDriverRating(@InputArgument UUID driverId, @InputArgument BigDecimal rating) {
        log.info("Updating driver {} rating to {}", driverId, rating);
        return driverService.updateDriverRating(driverId, rating);
    }
}