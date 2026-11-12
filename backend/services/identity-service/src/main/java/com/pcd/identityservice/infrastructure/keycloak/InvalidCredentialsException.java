package com.pcd.identityservice.infrastructure.keycloak;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
