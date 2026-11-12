package com.pcd.shared.messaging.outbox;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.mapping.AbstractJavaTypeMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class OutboxRelay {

    private static final Logger log = LoggerFactory.getLogger(OutboxRelay.class);

    private static final String SELECT_PENDING = """
            SELECT id, topic, message_key, payload_type, payload::text AS payload
            FROM outbox_events
            WHERE published_at IS NULL
            ORDER BY created_at
            LIMIT :limit
            FOR UPDATE SKIP LOCKED
            """;
    private static final String MARK_PUBLISHED = "UPDATE outbox_events SET published_at = :publishedAt WHERE id = :id";
    private static final String DELETE_PUBLISHED_BEFORE =
            "DELETE FROM outbox_events WHERE published_at IS NOT NULL AND published_at < :threshold";

    private final JdbcClient jdbcClient;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final TransactionTemplate transactionTemplate;
    private final OutboxProperties properties;
    private final Clock clock;

    public OutboxRelay(JdbcClient jdbcClient, KafkaTemplate<String, String> kafkaTemplate,
                       TransactionTemplate transactionTemplate, OutboxProperties properties, Clock clock) {
        this.jdbcClient = jdbcClient;
        this.kafkaTemplate = kafkaTemplate;
        this.transactionTemplate = transactionTemplate;
        this.properties = properties;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${smartstreet.outbox.poll-interval:500ms}")
    public void publishPendingEvents() {
        transactionTemplate.executeWithoutResult(status -> pendingEvents().stream()
                .takeWhile(this::send)
                .forEach(this::markPublished));
    }

    @Scheduled(cron = "${smartstreet.outbox.cleanup-cron:0 0 3 * * *}")
    public void deletePublishedEvents() {
        int deleted = jdbcClient.sql(DELETE_PUBLISHED_BEFORE)
                .param("threshold", Timestamp.from(clock.instant().minus(properties.retention())))
                .update();
        log.info("Removed {} published outbox events", deleted);
    }

    private List<PendingEvent> pendingEvents() {
        return jdbcClient.sql(SELECT_PENDING)
                .param("limit", properties.batchSize())
                .query((row, index) -> new PendingEvent(
                        row.getObject("id", UUID.class),
                        row.getString("topic"),
                        row.getString("message_key"),
                        row.getString("payload_type"),
                        row.getString("payload")))
                .list();
    }

    private boolean send(PendingEvent event) {
        ProducerRecord<String, String> record = new ProducerRecord<>(event.topic(), event.key(), event.payload());
        record.headers().add(new RecordHeader(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                event.payloadType().getBytes(StandardCharsets.UTF_8)));
        try {
            kafkaTemplate.send(record).get(properties.sendTimeout().toMillis(), TimeUnit.MILLISECONDS);
            return true;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return false;
        } catch (ExecutionException | TimeoutException exception) {
            log.warn("Could not publish outbox event {} to {}, retrying later", event.id(), event.topic(), exception);
            return false;
        }
    }

    private void markPublished(PendingEvent event) {
        jdbcClient.sql(MARK_PUBLISHED)
                .param("publishedAt", Timestamp.from(clock.instant()))
                .param("id", event.id())
                .update();
    }

    private record PendingEvent(UUID id, String topic, String key, String payloadType, String payload) {
    }
}
