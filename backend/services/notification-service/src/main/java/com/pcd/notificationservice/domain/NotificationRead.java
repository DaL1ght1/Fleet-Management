package com.pcd.notificationservice.domain;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_reads")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationRead {

    @EmbeddedId
    private Key key;

    private Instant readAt;

    @Embeddable
    public record Key(UUID notificationId, UUID accountId) implements Serializable {
    }
}
