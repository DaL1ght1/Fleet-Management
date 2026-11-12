package com.pcd.vehiclesservice.application;

import com.pcd.shared.error.ConflictException;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.shared.events.VehiclePositionEvent;
import com.pcd.shared.messaging.DomainEventPublisher;
import com.pcd.vehiclesservice.domain.Vehicle;
import com.pcd.vehiclesservice.domain.VehicleChanges;
import com.pcd.vehiclesservice.domain.VehicleSpecification;
import com.pcd.vehiclesservice.domain.VehicleStatus;
import com.pcd.vehiclesservice.infrastructure.persistence.VehicleRepository;
import com.pcd.vehiclesservice.infrastructure.persistence.VehicleSpecifications;
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
public class VehicleService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final long ODOMETER_SYNC_STEP_KM = 10;
    private static final Sort DEFAULT_SORT = Sort.by("make", "model", "licensePlate");
    private static final Set<TripEvent.Type> TRIP_ENDINGS =
            Set.of(TripEvent.Type.TRIP_COMPLETED, TripEvent.Type.TRIP_CANCELLED, TripEvent.Type.TRIP_DELETED);

    private final VehicleRepository vehicles;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Optional<Vehicle> find(UUID id) {
        return vehicles.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Vehicle> findByLicensePlate(String licensePlate) {
        return vehicles.findByLicensePlate(licensePlate.strip().toUpperCase(java.util.Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public Optional<Vehicle> findByVin(String vin) {
        return vehicles.findByVin(vin.strip().toUpperCase(java.util.Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public Page<Vehicle> search(VehicleCriteria criteria, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), DEFAULT_SORT);
        return vehicles.findAll(VehicleSpecifications.matching(criteria, today()), pageRequest);
    }

    @Transactional(readOnly = true)
    public FleetStatistics statistics() {
        Map<VehicleStatus, Long> counts = new EnumMap<>(VehicleStatus.class);
        vehicles.countByStatus().forEach(row -> counts.put(row.getStatus(), row.getCount()));
        return new FleetStatistics(counts, vehicles.countByCurrentTripIdIsNotNull(),
                vehicles.countByNextMaintenanceDateLessThanEqual(today()));
    }

    public Vehicle register(VehicleSpecification specification) {
        if (vehicles.existsByVin(specification.vin())) {
            throw new ConflictException("A vehicle with VIN %s already exists".formatted(specification.vin()));
        }
        ensurePlateAvailable(specification.licensePlate(), null);
        Vehicle vehicle = vehicles.save(Vehicle.register(specification));
        publish(VehicleEvent.Type.VEHICLE_REGISTERED, vehicle);
        return vehicle;
    }

    public Vehicle update(UUID id, VehicleChanges changes) {
        Vehicle vehicle = load(id);
        vehicle.update(changes);
        ensurePlateAvailable(vehicle.getLicensePlate(), id);
        publish(VehicleEvent.Type.VEHICLE_UPDATED, vehicle);
        return vehicle;
    }

    public Vehicle changeStatus(UUID id, VehicleStatus status) {
        Vehicle vehicle = load(id);
        if (vehicle.changeStatus(status)) {
            publish(VehicleEvent.Type.VEHICLE_STATUS_CHANGED, vehicle);
        }
        return vehicle;
    }

    public Vehicle recordOdometerReading(UUID id, long reading) {
        Vehicle vehicle = load(id);
        vehicle.recordOdometerReading(reading);
        publish(VehicleEvent.Type.VEHICLE_MILEAGE_RECORDED, vehicle);
        return vehicle;
    }

    public Vehicle completeMaintenance(UUID id, LocalDate date) {
        Vehicle vehicle = load(id);
        VehicleStatus before = vehicle.getStatus();
        vehicle.completeMaintenance(date == null ? today() : date);
        publish(before == vehicle.getStatus() ? VehicleEvent.Type.VEHICLE_UPDATED
                : VehicleEvent.Type.VEHICLE_STATUS_CHANGED, vehicle);
        return vehicle;
    }

    public void delete(UUID id) {
        Vehicle vehicle = load(id);
        vehicle.ensureDeletable();
        vehicles.delete(vehicle);
        publish(VehicleEvent.Type.VEHICLE_DELETED, vehicle);
    }

    public void onTripEvent(TripEvent event) {
        vehicles.findById(event.vehicleId()).ifPresent(vehicle -> {
            if (event.type() == TripEvent.Type.TRIP_STARTED) {
                vehicle.startTrip(event.tripId());
            } else if (TRIP_ENDINGS.contains(event.type())) {
                vehicle.finishTrip(event.tripId());
            }
        });
    }

    public void onVehiclePosition(VehiclePositionEvent event) {
        if (event.odometerKm() == null) {
            return;
        }
        long reading = (long) Math.floor(event.odometerKm());
        vehicles.findById(event.vehicleId())
                .filter(vehicle -> reading >= vehicle.getMileage() + ODOMETER_SYNC_STEP_KM)
                .ifPresent(vehicle -> {
                    vehicle.recordOdometerReading(reading);
                    publish(VehicleEvent.Type.VEHICLE_MILEAGE_RECORDED, vehicle);
                });
    }

    public void onMaintenanceEvent(MaintenanceEvent event) {
        vehicles.findById(event.vehicleId()).ifPresent(vehicle -> {
            if (event.type() == MaintenanceEvent.Type.WORK_ORDER_STARTED && vehicle.enterMaintenance()) {
                publish(VehicleEvent.Type.VEHICLE_STATUS_CHANGED, vehicle);
            } else if (event.type() == MaintenanceEvent.Type.WORK_ORDER_COMPLETED) {
                VehicleStatus before = vehicle.getStatus();
                vehicle.completeMaintenance(event.completedOn() == null ? today() : event.completedOn());
                publish(before == vehicle.getStatus() ? VehicleEvent.Type.VEHICLE_UPDATED
                        : VehicleEvent.Type.VEHICLE_STATUS_CHANGED, vehicle);
            }
        });
    }

    private void ensurePlateAvailable(String licensePlate, UUID vehicleId) {
        UUID excluded = vehicleId == null ? new UUID(0, 0) : vehicleId;
        if (vehicles.existsByLicensePlateAndIdNot(licensePlate, excluded)) {
            throw new ConflictException("License plate %s is already registered".formatted(licensePlate));
        }
    }

    private Vehicle load(UUID id) {
        return vehicles.findById(id).orElseThrow(() -> new NotFoundException("Vehicle", id));
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private void publish(VehicleEvent.Type type, Vehicle vehicle) {
        events.publish(Topics.VEHICLE_EVENTS, vehicle.getId().toString(), new VehicleEvent(
                UUID.randomUUID(), type, clock.instant(), vehicle.getId(), vehicle.getLicensePlate(),
                vehicle.getMake(), vehicle.getModel(), VehicleEvent.Status.valueOf(vehicle.getStatus().name()),
                vehicle.getMileage(), vehicle.getNextMaintenanceDate()));
    }
}
