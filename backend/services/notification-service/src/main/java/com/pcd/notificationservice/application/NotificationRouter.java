package com.pcd.notificationservice.application;

import com.pcd.notificationservice.domain.Audience;
import com.pcd.notificationservice.domain.KnownVehicle;
import com.pcd.notificationservice.domain.Notification;
import com.pcd.notificationservice.domain.NotificationKind;
import com.pcd.notificationservice.domain.Recipient;
import com.pcd.notificationservice.domain.Severity;
import com.pcd.notificationservice.infrastructure.persistence.KnownVehicleRepository;
import com.pcd.notificationservice.infrastructure.persistence.NotificationRepository;
import com.pcd.notificationservice.infrastructure.persistence.RecipientRepository;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.GeofenceEvent;
import com.pcd.shared.events.InvoiceEvent;
import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.events.VehicleEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationRouter {

    private final NotificationRepository notifications;
    private final RecipientRepository recipients;
    private final KnownVehicleRepository vehicles;
    private final Clock clock;

    @Value("${smartstreet.notifications.license-reminder-days:30}")
    private int licenseReminderDays;

    @Value("${smartstreet.notifications.retention:P90D}")
    private Duration retention;

    public void onGeofenceEvent(GeofenceEvent event) {
        if (alreadyHandled(event.eventId())) {
            return;
        }
        Map<String, String> params = params("vehicle", vehicleLabel(event.vehicleId()), "zone", event.geofenceName());
        NotificationKind kind = switch (event.type()) {
            case VEHICLE_ENTERED -> NotificationKind.GEOFENCE_ENTERED;
            case VEHICLE_EXITED -> NotificationKind.GEOFENCE_EXITED;
            case SPEED_LIMIT_EXCEEDED -> {
                params.put("speed", decimal(BigDecimal.valueOf(event.speedKph()), 0));
                if (event.speedLimitKph() != null) {
                    params.put("limit", decimal(BigDecimal.valueOf(event.speedLimitKph()), 0));
                }
                yield NotificationKind.SPEED_LIMIT_EXCEEDED;
            }
        };
        deliver(event.eventId(), event.occurredAt(), kind, Severity.valueOf(event.severity().name()),
                List.of(Audience.STAFF), params, "/vehicles/" + event.vehicleId());
    }

    public void onMaintenanceEvent(MaintenanceEvent event) {
        if (alreadyHandled(event.eventId())) {
            return;
        }
        NotificationKind kind = switch (event.type()) {
            case WORK_ORDER_SCHEDULED -> NotificationKind.MAINTENANCE_SCHEDULED;
            case WORK_ORDER_STARTED -> NotificationKind.MAINTENANCE_STARTED;
            case WORK_ORDER_COMPLETED -> NotificationKind.MAINTENANCE_COMPLETED;
            case WORK_ORDER_OVERDUE -> NotificationKind.MAINTENANCE_OVERDUE;
            case WORK_ORDER_CANCELLED -> null;
        };
        if (kind == null) {
            return;
        }
        Map<String, String> params = params("vehicle", vehicleLabel(event.vehicleId()), "title", event.title(),
                "date", event.scheduledFor() == null ? null : event.scheduledFor().toString());
        Severity severity = kind == NotificationKind.MAINTENANCE_OVERDUE ? Severity.WARNING : Severity.INFO;
        deliver(event.eventId(), event.occurredAt(), kind, severity, List.of(Audience.STAFF), params,
                "/maintenance/" + event.workOrderId());
    }

    public void onTripEvent(TripEvent event) {
        if (alreadyHandled(event.eventId())) {
            return;
        }
        Optional<Audience> driver = accountOf(event.driverId()).map(Audience::account);
        Optional<Audience> customer = accountOf(event.customerId()).map(Audience::account);
        Map<String, String> params = params("vehicle", vehicleLabel(event.vehicleId()),
                "start", event.scheduledStart() == null ? null : event.scheduledStart().toString());
        String link = "/my/trips";
        switch (event.type()) {
            case TRIP_SCHEDULED -> deliver(event.eventId(), event.occurredAt(), NotificationKind.TRIP_ASSIGNED,
                    Severity.INFO, present(driver), params, link);
            case TRIP_RESCHEDULED -> deliver(event.eventId(), event.occurredAt(), NotificationKind.TRIP_RESCHEDULED,
                    Severity.INFO, present(driver, customer), params, link);
            case TRIP_STARTED -> deliver(event.eventId(), event.occurredAt(), NotificationKind.TRIP_STARTED,
                    Severity.INFO, present(customer), params, link);
            case TRIP_COMPLETED -> {
                if (event.distanceKm() != null) {
                    params.put("distance", decimal(event.distanceKm(), 1));
                }
                deliver(event.eventId(), event.occurredAt(), NotificationKind.TRIP_COMPLETED, Severity.INFO,
                        present(customer), params, link);
            }
            case TRIP_CANCELLED -> {
                putIfPresent(params, "reason", event.cancellationReason());
                deliver(event.eventId(), event.occurredAt(), NotificationKind.TRIP_CANCELLED, Severity.WARNING,
                        present(driver, customer), params, link);
            }
            case TRIP_DELETED -> {
            }
        }
    }

    public void onInvoiceEvent(InvoiceEvent event) {
        if (alreadyHandled(event.eventId())) {
            return;
        }
        Optional<Audience> customer = accountOf(event.customerId()).map(Audience::account);
        Map<String, String> params = params("number", event.number(),
                "total", event.total() == null ? null : decimal(event.total(), 3),
                "dueDate", event.dueDate() == null ? null : event.dueDate().toString());
        switch (event.type()) {
            case INVOICE_ISSUED -> deliver(event.eventId(), event.occurredAt(), NotificationKind.INVOICE_ISSUED,
                    Severity.INFO, present(customer), params, "/my/invoices");
            case INVOICE_PAID -> {
                deliver(event.eventId(), event.occurredAt(), NotificationKind.INVOICE_PAID, Severity.INFO,
                        List.of(Audience.STAFF), params, "/billing/" + event.invoiceId());
                deliver(event.eventId(), event.occurredAt(), NotificationKind.INVOICE_PAID, Severity.INFO,
                        present(customer), params, "/my/invoices");
            }
            case INVOICE_OVERDUE -> {
                deliver(event.eventId(), event.occurredAt(), NotificationKind.INVOICE_OVERDUE, Severity.WARNING,
                        List.of(Audience.STAFF), params, "/billing/" + event.invoiceId());
                deliver(event.eventId(), event.occurredAt(), NotificationKind.INVOICE_OVERDUE, Severity.WARNING,
                        present(customer), params, "/my/invoices");
            }
            case INVOICE_DRAFTED, INVOICE_VOIDED -> {
            }
        }
    }

    public void onVehicleEvent(VehicleEvent event) {
        String label = event.make() == null ? event.licensePlate()
                : "%s · %s %s".formatted(event.licensePlate(), event.make(), event.model());
        vehicles.findById(event.vehicleId())
                .orElseGet(() -> vehicles.save(KnownVehicle.track(event.vehicleId())))
                .apply(event.occurredAt(), label);
    }

    public void onDriverEvent(DriverEvent event) {
        track(event.driverId(), Recipient.Kind.DRIVER).apply(event.occurredAt(), event.accountId(),
                event.firstName() + " " + event.lastName(), event.licenseExpiryDate(),
                event.type() == DriverEvent.Type.DRIVER_DELETED);
    }

    public void onCustomerEvent(CustomerEvent event) {
        track(event.customerId(), Recipient.Kind.CUSTOMER).apply(event.occurredAt(), event.accountId(),
                event.firstName() + " " + event.lastName(), null,
                event.type() == CustomerEvent.Type.CUSTOMER_DELETED);
    }

    public int remindExpiringLicenses() {
        LocalDate today = LocalDate.now(clock);
        Instant now = clock.instant();
        List<Recipient> due = recipients.findByKindAndDeletedFalseAndLicenseExpiryDateLessThanEqual(
                Recipient.Kind.DRIVER, today.plusDays(licenseReminderDays)).stream()
                .filter(driver -> driver.needsLicenseReminder(today, licenseReminderDays))
                .toList();
        due.forEach(driver -> {
            driver.licenseReminderSent();
            Severity severity = driver.getLicenseExpiryDate().isBefore(today) ? Severity.CRITICAL : Severity.WARNING;
            Map<String, String> params = params("driver", driver.getDisplayName(),
                    "date", driver.getLicenseExpiryDate().toString());
            UUID source = UUID.nameUUIDFromBytes((driver.getId() + ":" + driver.getLicenseExpiryDate())
                    .getBytes(StandardCharsets.UTF_8));
            deliver(source, now, NotificationKind.LICENSE_EXPIRING, severity, List.of(Audience.STAFF), params,
                    "/drivers/" + driver.getId());
            deliver(source, now, NotificationKind.LICENSE_EXPIRING, severity,
                    present(driver.account().map(Audience::account)), params, "/profile");
        });
        return due.size();
    }

    public int purgeExpired() {
        return notifications.purgeOlderThan(clock.instant().minus(retention));
    }

    private boolean alreadyHandled(UUID sourceEventId) {
        return notifications.existsBySourceEventId(sourceEventId);
    }

    private void deliver(UUID sourceEventId, Instant occurredAt, NotificationKind kind, Severity severity,
                         List<Audience> audiences, Map<String, String> params, String link) {
        audiences.forEach(audience -> notifications.save(
                Notification.of(sourceEventId, occurredAt, kind, severity, audience, params, link)));
    }

    private Recipient track(UUID id, Recipient.Kind kind) {
        return recipients.findById(id).orElseGet(() -> recipients.save(Recipient.track(id, kind)));
    }

    private Optional<UUID> accountOf(UUID recipientId) {
        return recipientId == null ? Optional.empty() : recipients.findById(recipientId).flatMap(Recipient::account);
    }

    private String vehicleLabel(UUID vehicleId) {
        return vehicles.findById(vehicleId).map(KnownVehicle::getLabel)
                .orElseGet(() -> vehicleId.toString().substring(0, 8).toUpperCase());
    }

    @SafeVarargs
    private static List<Audience> present(Optional<Audience>... audiences) {
        List<Audience> present = new ArrayList<>();
        for (Optional<Audience> audience : audiences) {
            audience.filter(candidate -> !present.contains(candidate)).ifPresent(present::add);
        }
        return present;
    }

    private static Map<String, String> params(String... keyValues) {
        Map<String, String> params = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            putIfPresent(params, keyValues[i], keyValues[i + 1]);
        }
        return params;
    }

    private static void putIfPresent(Map<String, String> params, String key, String value) {
        if (value != null && !value.isBlank()) {
            params.put(key, value);
        }
    }

    private static String decimal(BigDecimal value, int scale) {
        return value.setScale(scale, RoundingMode.HALF_UP).toPlainString();
    }
}
