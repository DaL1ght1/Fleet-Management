package com.pcd.notificationservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.notificationservice.api.graphql.types.Notification;
import com.pcd.notificationservice.api.graphql.types.NotificationKind;
import com.pcd.notificationservice.api.graphql.types.NotificationPage;
import com.pcd.notificationservice.api.graphql.types.NotificationParam;
import com.pcd.notificationservice.api.graphql.types.NotificationSeverity;
import com.pcd.notificationservice.application.NotificationInbox;
import com.pcd.notificationservice.application.NotificationInbox.InboxPage;
import com.pcd.notificationservice.application.NotificationInbox.Reader;
import com.pcd.shared.security.CurrentAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.ZoneOffset;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationResolver {

    private static final Set<String> STAFF_ROLES = Set.of("ROLE_ADMIN", "ROLE_MANAGER");

    private final NotificationInbox inbox;

    @DgsQuery
    public NotificationPage myNotifications(@InputArgument Boolean unreadOnly, @InputArgument Integer page,
                                            @InputArgument Integer size) {
        InboxPage result = inbox.list(reader(), Boolean.TRUE.equals(unreadOnly), page, size);
        return NotificationPage.newBuilder()
                .items(result.page().getContent().stream()
                        .map(item -> toGraphQl(item, result.readIds().contains(item.getId()))).toList())
                .totalCount(Math.toIntExact(result.page().getTotalElements()))
                .page(result.page().getNumber())
                .size(result.page().getSize())
                .hasNext(result.page().hasNext())
                .build();
    }

    @DgsQuery
    public Integer unreadNotificationCount() {
        return Math.toIntExact(inbox.unreadCount(reader()));
    }

    @DgsMutation
    public Notification markNotificationRead(@InputArgument UUID id) {
        return toGraphQl(inbox.markRead(reader(), id), true);
    }

    @DgsMutation
    public Integer markAllNotificationsRead() {
        return inbox.markAllRead(reader());
    }

    @DgsEntityFetcher(name = "Notification")
    public Notification notificationReference(Map<String, Object> representation) {
        return Notification.newBuilder().id(UUID.fromString(String.valueOf(representation.get("id")))).build();
    }

    private static Reader reader() {
        UUID accountId = CurrentAccount.id().orElseThrow(() -> new AccessDeniedException("No account"));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean staff = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .anyMatch(STAFF_ROLES::contains);
        return new Reader(accountId, staff);
    }

    private static Notification toGraphQl(com.pcd.notificationservice.domain.Notification notification,
                                          boolean read) {
        return Notification.newBuilder()
                .id(notification.getId())
                .kind(NotificationKind.valueOf(notification.getKind().name()))
                .severity(NotificationSeverity.valueOf(notification.getSeverity().name()))
                .params(notification.getParams().entrySet().stream()
                        .map(entry -> NotificationParam.newBuilder().key(entry.getKey()).value(entry.getValue())
                                .build())
                        .toList())
                .link(notification.getLink())
                .read(read)
                .createdAt(notification.getCreatedAt().atOffset(ZoneOffset.UTC))
                .build();
    }
}
