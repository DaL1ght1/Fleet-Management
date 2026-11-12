package com.pcd.tripsservice.application;

import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.tripsservice.domain.FleetResource;
import com.pcd.tripsservice.domain.FleetResourceKind;
import com.pcd.tripsservice.domain.KnownCustomer;
import com.pcd.tripsservice.infrastructure.persistence.FleetResourceRepository;
import com.pcd.tripsservice.infrastructure.persistence.KnownCustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FleetAvailabilityService {

    private static final String DELETED = "DELETED";

    private final FleetResourceRepository repository;
    private final KnownCustomerRepository customers;

    @Transactional(readOnly = true)
    public void requireKnownCustomer(UUID customerId) {
        if (!customers.existsByIdAndDeletedFalse(customerId)) {
            throw new BusinessRuleViolationException("Customer %s is unknown".formatted(customerId));
        }
    }

    @Transactional(readOnly = true)
    public List<UUID> driversOf(UUID accountId) {
        return repository.findByKindAndAccountId(FleetResourceKind.DRIVER, accountId).stream()
                .map(FleetResource::getId)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UUID> customersOf(UUID accountId) {
        return customers.findByAccountIdAndDeletedFalse(accountId).stream().map(KnownCustomer::getId).toList();
    }

    @Transactional
    public void onCustomerEvent(CustomerEvent event) {
        boolean deleted = event.type() == CustomerEvent.Type.CUSTOMER_DELETED;
        KnownCustomer customer = customers.findById(event.customerId())
                .orElseGet(() -> customers.save(KnownCustomer.track(event.customerId())));
        customer.apply(event.occurredAt(), event.accountId(), deleted);
    }

    @Transactional(readOnly = true)
    public void requireAssignable(FleetResourceKind kind, UUID id) {
        FleetResource resource = repository.findById(id)
                .filter(candidate -> candidate.getKind() == kind)
                .orElseThrow(() -> new BusinessRuleViolationException(
                        "%s %s is unknown".formatted(label(kind), id)));
        if (!resource.isAssignable()) {
            throw new BusinessRuleViolationException("%s %s is %s and cannot be assigned"
                    .formatted(label(kind), resource.describe(), resource.getStatus()));
        }
    }

    @Transactional
    public void onVehicleEvent(VehicleEvent event) {
        boolean deleted = event.type() == VehicleEvent.Type.VEHICLE_DELETED;
        String status = deleted ? DELETED : event.status().name();
        boolean assignable = !deleted && event.status() == VehicleEvent.Status.ACTIVE;
        track(event.vehicleId(), FleetResourceKind.VEHICLE)
                .apply(event.occurredAt(), event.licensePlate(), status, assignable, null);
    }

    @Transactional
    public void onDriverEvent(DriverEvent event) {
        boolean deleted = event.type() == DriverEvent.Type.DRIVER_DELETED;
        String status = deleted ? DELETED : event.status().name();
        boolean assignable = !deleted && event.status() == DriverEvent.Status.ACTIVE;
        String name = event.firstName() == null ? null : "%s %s".formatted(event.firstName(), event.lastName());
        track(event.driverId(), FleetResourceKind.DRIVER)
                .apply(event.occurredAt(), name, status, assignable, event.accountId());
    }

    private FleetResource track(UUID id, FleetResourceKind kind) {
        return repository.findById(id).orElseGet(() -> repository.save(FleetResource.track(id, kind)));
    }

    private static String label(FleetResourceKind kind) {
        return kind == FleetResourceKind.VEHICLE ? "Vehicle" : "Driver";
    }
}
