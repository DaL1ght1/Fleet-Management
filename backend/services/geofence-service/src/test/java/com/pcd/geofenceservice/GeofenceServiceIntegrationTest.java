package com.pcd.geofenceservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.geofenceservice.domain.AlertType;
import com.pcd.geofenceservice.domain.GeofenceAlert;
import com.pcd.geofenceservice.infrastructure.persistence.GeofenceAlertRepository;
import com.pcd.shared.events.GeofenceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehiclePositionEvent;
import graphql.ExecutionResult;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.mapping.AbstractJavaTypeMapper;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.kafka.ConfluentKafkaContainer;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = {
        "smartstreet.security.router-secret=test-secret",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost/certs",
        "smartstreet.outbox.poll-interval=100ms"
})
class GeofenceServiceIntegrationTest {

    private static final String CREATE = """
            mutation Create($input: GeofenceInput!) { createGeofence(input: $input) { id name vehiclesInside } }
            """;

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private GeofenceAlertRepository alerts;
    @Autowired
    private ConfluentKafkaContainer kafkaContainer;

    @Test
    @WithMockUser(roles = "MANAGER")
    void positionsCrossingAZoneRaiseAlertsAndEvents() throws Exception {
        ExecutionResult created = graphql.execute(CREATE, Map.of("input", Map.of(
                "name", "Tunis centre",
                "kind", "SERVICE_AREA",
                "speedLimitKph", 50,
                "polygon", List.of(point(36.79, 10.16), point(36.79, 10.20), point(36.82, 10.20), point(36.82, 10.16)))));
        assertThat(created.getErrors()).isEmpty();

        UUID vehicleId = UUID.randomUUID();
        Instant start = Instant.now().minusSeconds(120);
        sendPosition(vehicleId, start, 36.80, 10.18, 30);
        sendPosition(vehicleId, start.plusSeconds(30), 36.805, 10.185, 72);
        sendPosition(vehicleId, start.plusSeconds(60), 36.86, 10.18, 40);

        await().atMost(Duration.ofSeconds(30)).until(() -> alerts.count() == 3);
        assertThat(alerts.findAll()).extracting(GeofenceAlert::getType).containsExactlyInAnyOrder(
                AlertType.VEHICLE_ENTERED, AlertType.SPEED_LIMIT_EXCEEDED, AlertType.VEHICLE_EXITED);
        assertThat(publishedEvent(vehicleId).geofenceName()).isEqualTo("Tunis centre");

        @SuppressWarnings("unchecked")
        Map<String, Object> page = (Map<String, Object>) ((Map<String, Object>) graphql
                .execute("{ geofenceAlerts(filter: { acknowledged: false }) { totalCount } unacknowledgedAlertCount }")
                .getData()).get("geofenceAlerts");
        assertThat(page).containsEntry("totalCount", 3);
        assertThat(graphql.execute("mutation { acknowledgeAllGeofenceAlerts }").getErrors()).isEmpty();
        assertThat(alerts.countByAcknowledgedAtIsNull()).isZero();
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void zonesNeedExactlyOneShape() {
        ExecutionResult result = graphql.execute(CREATE, Map.of("input", Map.of(
                "name", "Ambiguous", "kind", "DEPOT", "radiusMeters", 200,
                "polygon", List.of(point(1, 1), point(1, 2), point(2, 2)))));

        assertThat(result.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).contains("either a polygon or a center"));
    }

    private static Map<String, Object> point(double latitude, double longitude) {
        return Map.of("latitude", latitude, "longitude", longitude);
    }

    private void sendPosition(UUID vehicleId, Instant at, double latitude, double longitude, double speed)
            throws Exception {
        VehiclePositionEvent event = new VehiclePositionEvent(UUID.randomUUID(), at, vehicleId, UUID.randomUUID(), at,
                latitude, longitude, speed, null, null, null, true);
        ProducerRecord<String, String> record = new ProducerRecord<>(Topics.VEHICLE_POSITIONS, vehicleId.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                VehiclePositionEvent.class.getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }

    private GeofenceEvent publishedEvent(UUID vehicleId) throws Exception {
        try (Consumer<String, String> consumer = new DefaultKafkaConsumerFactory<>(
                KafkaTestUtils.consumerProps(kafkaContainer.getBootstrapServers(), "geofence-test", "true"),
                new StringDeserializer(), new StringDeserializer()).createConsumer()) {
            consumer.subscribe(List.of(Topics.GEOFENCE_EVENTS));
            ConsumerRecord<String, String> record = await().atMost(Duration.ofSeconds(30)).until(() ->
                    StreamSupport.stream(consumer.poll(Duration.ofMillis(500)).spliterator(), false)
                            .filter(candidate -> candidate.key().equals(vehicleId.toString()))
                            .findFirst()
                            .orElse(null), Objects::nonNull);
            return objectMapper.readValue(record.value(), GeofenceEvent.class);
        }
    }
}
