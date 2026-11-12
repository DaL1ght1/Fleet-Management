package com.pcd.shared.messaging.outbox;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

@ConfigurationProperties("smartstreet.outbox")
public record OutboxProperties(
        @DefaultValue("100") int batchSize,
        @DefaultValue("10s") Duration sendTimeout,
        @DefaultValue("7d") Duration retention) {
}
