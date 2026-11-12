package com.pcd.telemetryservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.shared.events.VehiclePositionEvent;
import com.pcd.telemetryservice.infrastructure.persistence.KnownVehicleRepository;
import com.pcd.telemetryservice.infrastructure.web.IngestionController;
import graphql.ExecutionResult;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.mapping.AbstractJavaTypeMapper;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.client.RestClient;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = {
        "smartstreet.security.router-secret=test-secret",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost/certs",
        "smartstreet.outbox.poll-interval=100ms"
})
class TelemetryServiceIntegrationTest {

    @Autowired
    private ConfluentKafkaContainer kafkaContainer;

    private static final String REGISTER_DEVICE = """
            mutation Register($vehicleId: UUID!) {
              registerTelemetryDevice(vehicleId: $vehicleId, label: "Dashboard tracker") { apiKey device { id } }
            }
            """;
    private static final String POSITIONS = "{ vehiclePositions { vehicle { id } latitude speedKph moving stale } }";

    @LocalServerPort
    private int port;
    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private KnownVehicleRepository knownVehicles;

    @Test
    @WithMockUser(roles = "MANAGER")
    void devicesStreamPositionsThatBecomeVisibleAndArePublished() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        announceVehicle(vehicleId);
        await().atMost(Duration.ofSeconds(30)).until(() -> knownVehicles.existsById(vehicleId));

        ExecutionResult registration = graphql.execute(REGISTER_DEVICE, Map.of("vehicleId", vehicleId.toString()));
        assertThat(registration.getErrors()).isEmpty();
        String apiKey = (String) dataField(registration, "registerTelemetryDevice").get("apiKey");

        Instant recordedAt = Instant.now().minusSeconds(5);
        HttpStatusCode status = ingest(apiKey, Map.of("positions", List.of(Map.of(
                "recordedAt", recordedAt.toString(), "latitude", 36.8065, "longitude", 10.1815,
                "speedKph", 42.5, "odometerKm", 15230.4))));

        assertThat(status.value()).isEqualTo(202);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> positions = (List<Map<String, Object>>) ((Map<String, Object>) graphql
                .execute(POSITIONS).getData()).get("vehiclePositions");
        assertThat(positions).singleElement().satisfies(position -> {
            assertThat(position).containsEntry("vehicle", Map.of("id", vehicleId.toString()));
            assertThat(position).containsEntry("moving", true).containsEntry("stale", false);
        });
        assertThat(publishedPosition(vehicleId).odometerKm()).isEqualTo(15230.4);
    }

    @Test
    void unknownDeviceKeysAreRejected() {
        HttpStatusCode status = ingest("ssd_invalid", Map.of("positions", List.of()));

        assertThat(status.value()).isEqualTo(401);
    }

    private HttpStatusCode ingest(String apiKey, Object body) {
        return RestClient.create("http://localhost:" + port).post()
                .uri("/ingest/v1/positions")
                .header(IngestionController.DEVICE_KEY_HEADER, apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .exchange((request, response) -> response.getStatusCode());
    }

    private void announceVehicle(UUID vehicleId) throws Exception {
        VehicleEvent event = new VehicleEvent(UUID.randomUUID(), VehicleEvent.Type.VEHICLE_REGISTERED, Instant.now(),
                vehicleId, "123 TU 4567", "Toyota", "Corolla", VehicleEvent.Status.ACTIVE, 15000L, null);
        ProducerRecord<String, String> record = new ProducerRecord<>(Topics.VEHICLE_EVENTS, vehicleId.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                VehicleEvent.class.getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }

    private VehiclePositionEvent publishedPosition(UUID vehicleId) throws Exception {
        try (Consumer<String, String> consumer = new DefaultKafkaConsumerFactory<>(
                KafkaTestUtils.consumerProps(kafkaContainer.getBootstrapServers(), "positions-test", "true"),
                new StringDeserializer(), new StringDeserializer()).createConsumer()) {
            consumer.subscribe(List.of(Topics.VEHICLE_POSITIONS));
            ConsumerRecord<String, String> record = await().atMost(Duration.ofSeconds(30)).until(() ->
                    StreamSupport.stream(consumer.poll(Duration.ofMillis(500)).spliterator(), false)
                            .filter(candidate -> candidate.key().equals(vehicleId.toString()))
                            .findFirst()
                            .orElse(null), Objects::nonNull);
            return objectMapper.readValue(record.value(), VehiclePositionEvent.class);
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> dataField(ExecutionResult result, String field) {
        return (Map<String, Object>) ((Map<String, Object>) result.getData()).get(field);
    }
}
