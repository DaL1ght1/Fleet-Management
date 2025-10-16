package com.pcd.userservice.Service;

import com.pcd.shared.enums.DriverStatus;
import com.pcd.userservice.Entity.Driver;
import com.pcd.userservice.Entity.DTO.DriverDto;
import com.pcd.userservice.Exception.UserNotFoundException;
import java.math.BigDecimal;
import com.pcd.userservice.Repository.DriverRepository;
import com.pcd.userservice.Service.Interface.DriverServiceInt;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

import static java.lang.String.format;

@Service
@RequiredArgsConstructor
public class DriverService implements DriverServiceInt {

    private final DriverRepository driverRepository;
    private final Logger logger = Logger.getLogger(DriverService.class.getName());

    @Override
    public boolean driverExists(UUID driverId) {
        return driverRepository.findById(driverId).isPresent();
    }

    @Override
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    @Override
    public Driver getDriverById(UUID driverId) {
        return driverRepository.findById(driverId).orElseThrow(() -> 
            new UserNotFoundException(format("Cannot get driver: Driver with id %s not found", driverId)));
    }

    @Override
    public Driver getDriverByEmail(String email) {
        return driverRepository.findByEmail(email).orElseThrow(() -> 
            new UserNotFoundException(format("Cannot get driver: Driver with email %s not found", email)));
    }

    @Override
    public Driver getDriverByLicenseNumber(String licenseNumber) {
        return driverRepository.findByLicenseNumber(licenseNumber).orElseThrow(() -> 
            new UserNotFoundException(format("Cannot get driver: Driver with license number %s not found", licenseNumber)));
    }

    @Override
    public List<Driver> getDriversByStatus(DriverStatus status) {
        return driverRepository.findByStatus(status);
    }

    @Override
    public List<Driver> getAvailableDrivers() {
        return driverRepository.findAvailableDrivers();
    }

    @Override
    public List<Driver> getBusyDrivers() {
        return driverRepository.findBusyDrivers();
    }

    @Override
    public List<Driver> searchDriversByName(String name) {
        return driverRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public List<Driver> getDriversWithLicenseExpiringWithin(long days) {
        return driverRepository.findDriversWithLicenseExpiringWithin(days);
    }

    @Override
    public Driver createDriver(DriverDto driverDto) {
        logger.info("Creating new driver with email: " + driverDto.getEmail());
        Driver driver = driverDto.toDriver();
        
        // Set hire date to today if not provided
        if (driver.getHireDate() == null) {
            driver.setHireDate(LocalDate.now());
        }
        
        return driverRepository.save(driver);
    }

    @Override
    public Driver updateDriver(UUID id, DriverDto driverDto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        format("Cannot update driver: Driver with id %s not found", id)));
        
        mergeDriver(driver, driverDto);
        return driverRepository.save(driver);
    }

    @Override
    public Boolean deleteDriver(UUID driverId) {
        try {
            if (!driverRepository.existsById(driverId)) {
                throw new UserNotFoundException(
                    format("Cannot delete driver: Driver with id %s not found", driverId));
            }
            driverRepository.deleteById(driverId);
            logger.info("Successfully deleted driver with id: " + driverId);
            return true;
        } catch (Exception e) {
            logger.severe("Error deleting driver with id " + driverId + ": " + e.getMessage());
            return false;
        }
    }

    @Override
    public Driver assignDriverToTrip(UUID driverId, UUID tripId) {
        Driver driver = getDriverById(driverId);
        
        if (driver.getStatus() != DriverStatus.ACTIVE) {
            throw new IllegalStateException("Cannot assign inactive driver to trip");
        }
        
        if (driver.getCurrentTripId() != null) {
            throw new IllegalStateException("Driver is already assigned to another trip");
        }
        
        driver.setCurrentTripId(tripId);
        return driverRepository.save(driver);
    }

    @Override
    public Driver unassignDriverFromTrip(UUID driverId) {
        Driver driver = getDriverById(driverId);
        driver.setCurrentTripId(null);
        return driverRepository.save(driver);
    }

    @Override
    public Driver updateDriverRating(UUID driverId, BigDecimal rating) {
        if (rating.compareTo(BigDecimal.ZERO) < 0 || rating.compareTo(new BigDecimal("5.0")) > 0) {
            throw new IllegalArgumentException("Rating must be between 0.0 and 5.0");
        }
        
        Driver driver = getDriverById(driverId);
        driver.setRating(rating);
        return driverRepository.save(driver);
    }

    @Override
    public DriverStatistics getDriverStatistics() {
        long totalDrivers = driverRepository.count();
        long activeDrivers = driverRepository.countByStatus(DriverStatus.ACTIVE);
        long inactiveDrivers = totalDrivers - activeDrivers;
        long availableDrivers = driverRepository.countAvailableDrivers();
        long busyDrivers = driverRepository.countBusyDrivers();
        
        return new DriverStatistics(totalDrivers, activeDrivers, inactiveDrivers, 
                                   availableDrivers, busyDrivers);
    }

    /**
     * Merge DriverDto fields into existing Driver entity (only non-null fields)
     */
    private void mergeDriver(Driver driver, DriverDto driverDto) {
        if (StringUtils.isNotBlank(driverDto.getFirstName())) {
            driver.setFirstName(driverDto.getFirstName());
        }
        if (StringUtils.isNotBlank(driverDto.getLastName())) {
            driver.setLastName(driverDto.getLastName());
        }
        if (StringUtils.isNotBlank(driverDto.getEmail())) {
            driver.setEmail(driverDto.getEmail());
        }
        if (StringUtils.isNotBlank(driverDto.getPhone())) {
            driver.setPhoneNumber(driverDto.getPhone());
        }
        if (StringUtils.isNotBlank(driverDto.getLicenseNumber())) {
            driver.setLicenseNumber(driverDto.getLicenseNumber());
        }
        if (driverDto.getLicenseExpiryDate() != null) {
            driver.setLicenseExpiryDate(driverDto.getLicenseExpiryDate());
        }
        if (driverDto.getStatus() != null) {
            driver.setStatus(driverDto.getStatus());
        }
        if (driverDto.getDateOfBirth() != null) {
            driver.setDateOfBirth(driverDto.getDateOfBirth());
        }
        if (driverDto.getHireDate() != null) {
            driver.setHireDate(driverDto.getHireDate());
        }
        if (StringUtils.isNotBlank(driverDto.getEmergencyContactName())) {
            driver.setEmergencyContactName(driverDto.getEmergencyContactName());
        }
        if (StringUtils.isNotBlank(driverDto.getEmergencyContactPhone())) {
            driver.setEmergencyContactPhone(driverDto.getEmergencyContactPhone());
        }
        if (driverDto.getCurrentTripId() != null) {
            driver.setCurrentTripId(driverDto.getCurrentTripId());
        }
        if (driverDto.getRating() != null) {
            driver.setRating(driverDto.getRating());
        }
    }
}