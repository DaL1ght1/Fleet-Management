package com.pcd.shared;

import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.Map;

public class SmartStreetDefaultsEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "smartStreetDefaults";

    private static final Map<String, Object> DEFAULTS = Map.ofEntries(
            Map.entry("spring.kafka.producer.key-serializer", StringSerializer.class.getName()),
            Map.entry("spring.kafka.producer.value-serializer", StringSerializer.class.getName()),
            Map.entry("spring.kafka.producer.acks", "all"),
            Map.entry("spring.kafka.producer.properties.enable.idempotence", "true"),
            Map.entry("spring.kafka.consumer.group-id", "${spring.application.name}"),
            Map.entry("spring.kafka.consumer.auto-offset-reset", "earliest"),
            Map.entry("spring.kafka.consumer.enable-auto-commit", "false"),
            Map.entry("spring.kafka.consumer.key-deserializer", StringDeserializer.class.getName()),
            Map.entry("spring.kafka.consumer.value-deserializer", ErrorHandlingDeserializer.class.getName()),
            Map.entry("spring.kafka.consumer.properties.spring.deserializer.value.delegate.class",
                    JsonDeserializer.class.getName()),
            Map.entry("spring.kafka.consumer.properties.spring.json.trusted.packages", "com.pcd.shared.events"),
            Map.entry("spring.kafka.listener.ack-mode", "record"),
            Map.entry("spring.flyway.locations", "classpath:db/migration,classpath:db/shared"),
            Map.entry("spring.jpa.open-in-view", "false"),
            Map.entry("spring.jpa.hibernate.ddl-auto", "validate"),
            Map.entry("spring.jackson.serialization.write-dates-as-timestamps", "false"),
            Map.entry("management.endpoints.web.exposure.include", "health,info,prometheus"),
            Map.entry("management.endpoint.health.probes.enabled", "true"));

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        environment.getPropertySources().addLast(new MapPropertySource(SOURCE_NAME, DEFAULTS));
    }
}
