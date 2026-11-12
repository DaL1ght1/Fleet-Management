package com.pcd.telemetryservice.application;

public class DeviceAuthenticationException extends RuntimeException {

    public DeviceAuthenticationException() {
        super("Unknown or revoked device key");
    }
}
