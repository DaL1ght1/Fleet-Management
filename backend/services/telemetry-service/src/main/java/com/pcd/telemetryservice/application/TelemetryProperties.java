package com.pcd.telemetryservice.application;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

@ConfigurationProperties("smartstreet.telemetry")
public record TelemetryProperties(
        @DefaultValue("5m") Duration staleAfter,
        @DefaultValue("90d") Duration retention,
        @DefaultValue("7d") Duration maxTrackWindow,
        @DefaultValue("5000") int maxTrackPoints,
        @DefaultValue("500") int maxBatchSize) {
}
