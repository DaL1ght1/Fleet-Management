package com.pcd.tripsservice.application;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.math.BigDecimal;

@ConfigurationProperties("smartstreet.trips.booking")
public record BookingProperties(
        @DefaultValue("8.000") BigDecimal baseFare,
        @DefaultValue("0.850") BigDecimal pricePerKm,
        @DefaultValue("45") int averageSpeedKph,
        @DefaultValue("1.3") double roadFactor,
        @DefaultValue("15") int handoverMinutes) {
}
