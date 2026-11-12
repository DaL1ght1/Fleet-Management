package com.pcd.maintenanceservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "maintained_vehicles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MaintainedVehicle {

    @Id
    private UUID id;

    private String licensePlate;

    private LocalDate nextMaintenanceDate;

    private boolean deleted;

    private Instant lastEventAt;

    public static MaintainedVehicle track(UUID id) {
        MaintainedVehicle vehicle = new MaintainedVehicle();
        vehicle.id = id;
        vehicle.lastEventAt = Instant.EPOCH;
        return vehicle;
    }

    public boolean apply(Instant eventTime, String plate, LocalDate nextMaintenance, boolean nowDeleted) {
        if (!eventTime.isAfter(lastEventAt)) {
            return false;
        }
        lastEventAt = eventTime;
        licensePlate = plate;
        if (nextMaintenance != null) {
            nextMaintenanceDate = nextMaintenance;
        }
        deleted = nowDeleted;
        return true;
    }
}
