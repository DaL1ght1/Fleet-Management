package com.pcd.notificationservice.application;

import com.pcd.notificationservice.domain.Notification;
import com.pcd.notificationservice.infrastructure.persistence.NotificationRepository;
import com.pcd.shared.error.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationInbox {

    private static final int MAX_PAGE_SIZE = 100;

    private final NotificationRepository notifications;

    @Transactional(readOnly = true)
    public InboxPage list(Reader reader, boolean unreadOnly, int page, int size) {
        PageRequest request = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE));
        Page<Notification> result = unreadOnly
                ? notifications.unreadBy(reader.accountId(), reader.staff(), request)
                : notifications.visibleTo(reader.accountId(), reader.staff(), request);
        Set<UUID> read = result.isEmpty() ? Set.of()
                : new HashSet<>(notifications.readAmong(reader.accountId(),
                result.getContent().stream().map(Notification::getId).toList()));
        return new InboxPage(result, read);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Reader reader) {
        return notifications.countUnread(reader.accountId(), reader.staff());
    }

    public Notification markRead(Reader reader, UUID id) {
        Notification notification = notifications.findVisible(id, reader.accountId(), reader.staff())
                .orElseThrow(() -> new NotFoundException("Notification", id));
        notifications.markRead(id, reader.accountId());
        return notification;
    }

    public int markAllRead(Reader reader) {
        return notifications.markAllRead(reader.accountId(), reader.staff());
    }

    public record Reader(UUID accountId, boolean staff) {
    }

    public record InboxPage(Page<Notification> page, Set<UUID> readIds) {
    }
}
