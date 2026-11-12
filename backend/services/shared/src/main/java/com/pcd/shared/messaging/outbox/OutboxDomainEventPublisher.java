package com.pcd.shared.messaging.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcd.shared.messaging.DomainEventPublisher;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Clock;
import java.util.UUID;

public class OutboxDomainEventPublisher implements DomainEventPublisher {

    private static final String INSERT_EVENT = """
            INSERT INTO outbox_events (id, topic, message_key, payload_type, payload, created_at)
            VALUES (:id, :topic, :messageKey, :payloadType, CAST(:payload AS jsonb), :createdAt)
            """;

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public OutboxDomainEventPublisher(JdbcClient jdbcClient, ObjectMapper objectMapper, Clock clock) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
        this.clock = clock;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void publish(String topic, String key, Object event) {
        jdbcClient.sql(INSERT_EVENT)
                .param("id", UUID.randomUUID())
                .param("topic", topic)
                .param("messageKey", key)
                .param("payloadType", event.getClass().getName())
                .param("payload", serialize(event))
                .param("createdAt", Timestamp.from(clock.instant()))
                .update();
    }

    private String serialize(Object event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Cannot serialize event " + event.getClass().getName(), exception);
        }
    }
}
