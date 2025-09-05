package com.pcd.userservice.Entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Permission {

    // Administrator Permissions
    ADMIN_READ("admin:read"),
    ADMIN_CREATE("admin:create"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_DELETE("admin:delete"),

   USER_READ("admin:read"),
   USER_CREATE("admin:create"),
   USER_UPDATE("admin:update"),
   USER_DELETE("admin:delete");


    private final String permission;
}
