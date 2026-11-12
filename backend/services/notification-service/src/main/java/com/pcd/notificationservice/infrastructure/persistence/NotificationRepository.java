package com.pcd.notificationservice.infrastructure.persistence;

import com.pcd.notificationservice.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    String VISIBLE = "((n.staffAudience = true and :staff = true) or n.recipientAccountId = :accountId)";
    String UNREAD = """
            not exists (select r from NotificationRead r
            where r.key.notificationId = n.id and r.key.accountId = :accountId)
            """;

    boolean existsBySourceEventId(UUID sourceEventId);

    @Query("select n from Notification n where " + VISIBLE + " order by n.createdAt desc")
    Page<Notification> visibleTo(UUID accountId, boolean staff, Pageable pageable);

    @Query("select n from Notification n where " + VISIBLE + " and " + UNREAD + " order by n.createdAt desc")
    Page<Notification> unreadBy(UUID accountId, boolean staff, Pageable pageable);

    @Query("select count(n) from Notification n where " + VISIBLE + " and " + UNREAD)
    long countUnread(UUID accountId, boolean staff);

    @Query("select n from Notification n where n.id = :id and " + VISIBLE)
    Optional<Notification> findVisible(UUID id, UUID accountId, boolean staff);

    @Query("""
            select r.key.notificationId from NotificationRead r
            where r.key.accountId = :accountId and r.key.notificationId in :ids
            """)
    List<UUID> readAmong(UUID accountId, Collection<UUID> ids);

    @Modifying
    @Query(value = """
            INSERT INTO notification_reads (notification_id, account_id, read_at)
            VALUES (:id, :accountId, now()) ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    void markRead(UUID id, UUID accountId);

    @Modifying
    @Query(value = """
            INSERT INTO notification_reads (notification_id, account_id, read_at)
            SELECT n.id, :accountId, now() FROM notifications n
            WHERE (n.staff_audience AND :staff) OR n.recipient_account_id = :accountId
            ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    int markAllRead(UUID accountId, boolean staff);

    @Modifying
    @Query("delete from Notification n where n.createdAt < :cutoff")
    int purgeOlderThan(Instant cutoff);
}
