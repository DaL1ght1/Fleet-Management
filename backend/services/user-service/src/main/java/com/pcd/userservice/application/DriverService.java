package com.pcd.userservice.application;

import com.pcd.shared.error.ConflictException;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.AccountEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import com.pcd.userservice.domain.Driver;
import com.pcd.userservice.domain.DriverProfile;
import com.pcd.userservice.domain.DriverStatus;
import com.pcd.userservice.infrastructure.persistence.DriverRepository;
import com.pcd.userservice.infrastructure.persistence.PeopleSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final String DRIVER_ROLE = "DRIVER";
    private static final int LICENSE_EXPIRY_WARNING_DAYS = 30;
    private static final Sort DEFAULT_SORT = Sort.by("lastName", "firstName");
    private static final UUID NO_DRIVER = new UUID(0, 0);
    private static final Set<TripEvent.Type> RELEASING_EVENTS =
            Set.of(TripEvent.Type.TRIP_CANCELLED, TripEvent.Type.TRIP_DELETED);

    private final DriverRepository drivers;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Optional<Driver> find(UUID id) {
        return drivers.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Driver> findByAccount(UUID accountId) {
        return drivers.findByAccountId(accountId);
    }

    @Transactional(readOnly = true)
    public Page<Driver> search(DriverCriteria criteria, int page, int size) {
        return drivers.findAll(PeopleSpecifications.driversMatching(criteria, today()),
                PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), DEFAULT_SORT));
    }

    @Transactional(readOnly = true)
    public DriverStatistics statistics() {
        Map<DriverStatus, Long> counts = new EnumMap<>(DriverStatus.class);
        drivers.countByStatus().forEach(row -> counts.put(row.getStatus(), row.getCount()));
        LocalDate today = today();
        return new DriverStatistics(counts, drivers.countAvailable(today), drivers.countByCurrentTripIdIsNotNull(),
                drivers.countByLicenseExpiryDateBetween(today, today.plusDays(LICENSE_EXPIRY_WARNING_DAYS)));
    }

    public Driver register(DriverRegistration registration) {
        DriverProfile profile = registration.toProfile(today());
        ensureUnique(profile, NO_DRIVER);
        Driver driver = drivers.save(Driver.register(profile));
        publish(DriverEvent.Type.DRIVER_REGISTERED, driver);
        return driver;
    }

    public Driver update(UUID id, DriverProfileChanges changes) {
        Driver driver = load(id);
        DriverProfile profile = changes.applyTo(driver.profile());
        ensureUnique(profile, id);
        driver.update(profile);
        publish(DriverEvent.Type.DRIVER_UPDATED, driver);
        return driver;
    }

    public Driver changeStatus(UUID id, DriverStatus status) {
        Driver driver = load(id);
        if (driver.changeStatus(status)) {
            publish(DriverEvent.Type.DRIVER_STATUS_CHANGED, driver);
        }
        return driver;
    }

    public Driver rate(UUID id, int rating) {
        Driver driver = load(id);
        driver.rate(rating);
        return driver;
    }

    public void delete(UUID id) {
        Driver driver = load(id);
        driver.ensureDeletable();
        drivers.delete(driver);
        publish(DriverEvent.Type.DRIVER_DELETED, driver);
    }

    public void onTripEvent(TripEvent event) {
        if (event.driverId() == null) {
            return;
        }
        drivers.findById(event.driverId()).ifPresent(driver -> {
            if (event.type() == TripEvent.Type.TRIP_STARTED) {
                driver.startTrip(event.tripId());
            } else if (event.type() == TripEvent.Type.TRIP_COMPLETED) {
                driver.completeTrip(event.tripId());
            } else if (RELEASING_EVENTS.contains(event.type())) {
                driver.releaseTrip(event.tripId());
            }
        });
    }

    public void onAccountEvent(AccountEvent event) {
        if (!DRIVER_ROLE.equals(event.role())) {
            return;
        }
        drivers.findByEmail(event.email().strip().toLowerCase(java.util.Locale.ROOT))
                .filter(driver -> !event.accountId().equals(driver.getAccountId()))
                .ifPresent(driver -> {
                    driver.linkAccount(event.accountId());
                    publish(DriverEvent.Type.DRIVER_UPDATED, driver);
                });
    }

    private void ensureUnique(DriverProfile profile, UUID driverId) {
        if (drivers.existsByEmailAndIdNot(profile.email(), driverId)) {
            throw new ConflictException("A driver with email %s already exists".formatted(profile.email()));
        }
        if (drivers.existsByLicenseNumberAndIdNot(profile.licenseNumber(), driverId)) {
            throw new ConflictException("License %s is already registered".formatted(profile.licenseNumber()));
        }
        if (profile.accountId() != null && drivers.existsByAccountIdAndIdNot(profile.accountId(), driverId)) {
            throw new ConflictException("Account %s is already linked to a driver".formatted(profile.accountId()));
        }
    }

    private Driver load(UUID id) {
        return drivers.findById(id).orElseThrow(() -> new NotFoundException("Driver", id));
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private void publish(DriverEvent.Type type, Driver driver) {
        events.publish(Topics.DRIVER_EVENTS, driver.getId().toString(), new DriverEvent(UUID.randomUUID(), type,
                clock.instant(), driver.getId(), driver.getAccountId(), driver.getFirstName(), driver.getLastName(), driver.getEmail(),
                DriverEvent.Status.valueOf(driver.getStatus().name()), driver.getLicenseExpiryDate(),
                driver.getHireDate(), driver.getMonthlySalary()));
    }
}
