package com.pcd.notificationservice.domain;

import java.util.UUID;

public sealed interface Audience {

    Staff STAFF = new Staff();

    static Audience account(UUID accountId) {
        return new Account(accountId);
    }

    record Staff() implements Audience {
    }

    record Account(UUID accountId) implements Audience {
    }
}
