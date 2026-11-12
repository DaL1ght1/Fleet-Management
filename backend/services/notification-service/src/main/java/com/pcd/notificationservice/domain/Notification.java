package com.pcd.notificationservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    private UUID id;

    private UUID sourceEventId;

    @Enumerated(EnumType.STRING)
    private NotificationKind kind;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    private boolean staffAudience;

    private UUID recipientAccountId;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> params;

    private String link;

    private Instant createdAt;

    public static Notification of(UUID sourceEventId, Instant occurredAt, NotificationKind kind, Severity severity,
                                  Audience audience, Map<String, String> params, String link) {
        Notification notification = new Notification();
        notification.id = UUID.randomUUID();
        notification.sourceEventId = Objects.requireNonNull(sourceEventId);
        notification.kind = Objects.requireNonNull(kind);
        notification.severity = Objects.requireNonNull(severity);
        switch (audience) {
            case Audience.Staff staff -> notification.staffAudience = true;
            case Audience.Account account -> notification.recipientAccountId =
                    Objects.requireNonNull(account.accountId());
        }
        notification.params = new LinkedHashMap<>(params);
        notification.link = link;
        notification.createdAt = occurredAt;
        return notification;
    }
}
