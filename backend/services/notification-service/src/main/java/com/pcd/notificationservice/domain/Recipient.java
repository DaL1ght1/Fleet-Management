package com.pcd.notificationservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "recipients")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recipient {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Kind kind;

    private UUID accountId;

    private String displayName;

    private LocalDate licenseExpiryDate;

    private LocalDate licenseReminderSentFor;

    private boolean deleted;

    private Instant lastEventAt;

    public static Recipient track(UUID id, Kind kind) {
        Recipient recipient = new Recipient();
        recipient.id = id;
        recipient.kind = kind;
        recipient.lastEventAt = Instant.EPOCH;
        return recipient;
    }

    public void apply(Instant eventTime, UUID linkedAccountId, String name, LocalDate licenseExpiry,
                      boolean nowDeleted) {
        if (!eventTime.isAfter(lastEventAt)) {
            return;
        }
        lastEventAt = eventTime;
        if (linkedAccountId != null) {
            accountId = linkedAccountId;
        }
        displayName = name;
        licenseExpiryDate = licenseExpiry;
        deleted = nowDeleted;
    }

    public Optional<UUID> account() {
        return deleted ? Optional.empty() : Optional.ofNullable(accountId);
    }

    public boolean needsLicenseReminder(LocalDate today, int daysAhead) {
        return !deleted && licenseExpiryDate != null && !licenseExpiryDate.equals(licenseReminderSentFor)
                && !licenseExpiryDate.isAfter(today.plusDays(daysAhead));
    }

    public void licenseReminderSent() {
        licenseReminderSentFor = licenseExpiryDate;
    }

    public enum Kind {
        DRIVER,
        CUSTOMER
    }
}
