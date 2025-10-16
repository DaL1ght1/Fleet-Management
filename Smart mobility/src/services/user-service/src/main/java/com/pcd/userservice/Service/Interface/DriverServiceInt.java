package com.pcd.userservice.Service.Interface;

import com.pcd.shared.enums.DriverStatus;
import com.pcd.userservice.Entity.Driver;
import com.pcd.userservice.Entity.DTO.DriverDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface DriverServiceInt {

    /**
     * Check if a driver exists by ID
     */
    boolean driverExists(UUID driverId);

    /**
     * Get all drivers
     */
    List<Driver> getAllDrivers();

    /**
     * Get driver by ID
     */
    Driver getDriverById(UUID driverId);

    /**
     * Get driver by email
     */
    Driver getDriverByEmail(String email);

    /**
     * Get driver by license number
     */
    Driver getDriverByLicenseNumber(String licenseNumber);

    /**
     * Get drivers by status
     */
    List<Driver> getDriversByStatus(DriverStatus status);

    /**
     * Get available drivers (active and not on trip)
     */
    List<Driver> getAvailableDrivers();

    /**
     * Get busy drivers (active and on trip)
     */
    List<Driver> getBusyDrivers();

    /**
     * Search drivers by name
     */
    List<Driver> searchDriversByName(String name);

    /**
     * Get drivers with license expiring soon
     */
    List<Driver> getDriversWithLicenseExpiringWithin(long days);

    /**
     * Create a new driver
     */
    Driver createDriver(DriverDto driverDto);

    /**
     * Update an existing driver
     */
    Driver updateDriver(UUID id, DriverDto driverDto);

    /**
     * Delete a driver
     */
    Boolean deleteDriver(UUID driverId);

    /**
     * Assign driver to trip
     */
    Driver assignDriverToTrip(UUID driverId, UUID tripId);

    /**
     * Unassign driver from trip
     */
    Driver unassignDriverFromTrip(UUID driverId);

    /**
     * Update driver rating
     */
    Driver updateDriverRating(UUID driverId, BigDecimal rating);

    /**
     * Get driver statistics
     */
    DriverStatistics getDriverStatistics();

    /**
     * Inner class for driver statistics
     */
    class DriverStatistics {
        private final long totalDrivers;
        private final long activeDrivers;
        private final long inactiveDrivers;
        private final long availableDrivers;
        private final long busyDrivers;

        public DriverStatistics(long totalDrivers, long activeDrivers, long inactiveDrivers, 
                               long availableDrivers, long busyDrivers) {
            this.totalDrivers = totalDrivers;
            this.activeDrivers = activeDrivers;
            this.inactiveDrivers = inactiveDrivers;
            this.availableDrivers = availableDrivers;
            this.busyDrivers = busyDrivers;
        }

        // Getters
        public long getTotalDrivers() { return totalDrivers; }
        public long getActiveDrivers() { return activeDrivers; }
        public long getInactiveDrivers() { return inactiveDrivers; }
        public long getAvailableDrivers() { return availableDrivers; }
        public long getBusyDrivers() { return busyDrivers; }
    }
}