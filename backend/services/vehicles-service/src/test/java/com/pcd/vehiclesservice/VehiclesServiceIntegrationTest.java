package com.pcd.vehiclesservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.vehiclesservice.infrastructure.persistence.VehicleRepository;
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
class VehiclesServiceIntegrationTest {

    @Autowired
    private ConfluentKafkaContainer kafkaContainer;

    private static final String REGISTER = """
            mutation Register($input: RegisterVehicleInput!) {
              registerVehicle(input: $input) { id licensePlate status nextMaintenanceDate maintenanceDue inUse }
            }
            """;
    private static final String DELETE = "mutation Delete($id: UUID!) { deleteVehicle(id: $id) }";

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private VehicleRepository vehicles;

    @Test
    @WithMockUser(roles = "ADMIN")
    void registeredVehiclesArePublishedAndTrackTheirTrips() throws Exception {
        ExecutionResult registration = graphql.execute(REGISTER, Map.of("input", registerInput("JTDBR32E540012345")));

        assertThat(registration.getErrors()).isEmpty();
        Map<String, Object> vehicle = dataField(registration, "registerVehicle");
        UUID vehicleId = UUID.fromString((String) vehicle.get("id"));
        assertThat(vehicle).containsEntry("licensePlate", "200 TU 1234").containsEntry("inUse", false);
        assertThat(publishedVehicleEvent(vehicleId).type()).isEqualTo(VehicleEvent.Type.VEHICLE_REGISTERED);

        UUID tripId = UUID.randomUUID();
        sendTripEvent(TripEvent.Type.TRIP_STARTED, tripId, vehicleId);
        await().atMost(Duration.ofSeconds(30)).until(() -> vehicles.findById(vehicleId).orElseThrow().isInUse());

        ExecutionResult blockedDeletion = graphql.execute(DELETE, Map.of("id", vehicleId.toString()));
        assertThat(blockedDeletion.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).contains("cannot be deleted"));

        sendTripEvent(TripEvent.Type.TRIP_COMPLETED, tripId, vehicleId);
        await().atMost(Duration.ofSeconds(30)).until(() -> !vehicles.findById(vehicleId).orElseThrow().isInUse());

        assertThat(graphql.execute(DELETE, Map.of("id", vehicleId.toString())).getErrors()).isEmpty();
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void duplicateVinsAreRejected() {
        graphql.execute(REGISTER, Map.of("input", registerInput("1HGCM82633A004352")));

        ExecutionResult duplicate = graphql.execute(REGISTER, Map.of("input", registerInput("1HGCM82633A004352")));

        assertThat(duplicate.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).contains("already exists"));
    }

    private VehicleEvent publishedVehicleEvent(UUID vehicleId) throws Exception {
        try (Consumer<String, String> consumer = new DefaultKafkaConsumerFactory<>(
                KafkaTestUtils.consumerProps(kafkaContainer.getBootstrapServers(), "vehicle-events-test", "true"),
                new StringDeserializer(), new StringDeserializer()).createConsumer()) {
            consumer.subscribe(List.of(Topics.VEHICLE_EVENTS));
            ConsumerRecord<String, String> record = await().atMost(Duration.ofSeconds(30)).until(() ->
                    StreamSupport.stream(consumer.poll(Duration.ofMillis(500)).spliterator(), false)
                            .filter(candidate -> candidate.key().equals(vehicleId.toString()))
                            .findFirst()
                            .orElse(null), Objects::nonNull);
            return objectMapper.readValue(record.value(), VehicleEvent.class);
        }
    }

    private void sendTripEvent(TripEvent.Type type, UUID tripId, UUID vehicleId) throws Exception {
        TripEvent event = new TripEvent(UUID.randomUUID(), type, Instant.now(), tripId, vehicleId, null, null,
                TripEvent.Kind.RENTAL, TripEvent.Status.IN_PROGRESS, null, null, null, null, null, null, null);
        ProducerRecord<String, String> record = new ProducerRecord<>(Topics.TRIP_EVENTS, tripId.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                TripEvent.class.getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }

    private static Map<String, Object> registerInput(String vin) {
        return Map.ofEntries(
                Map.entry("make", "Peugeot"),
                Map.entry("model", "208"),
                Map.entry("year", 2023),
                Map.entry("licensePlate", vin.startsWith("JT") ? "200 tu 1234" : "201 TU 9999"),
                Map.entry("vin", vin),
                Map.entry("color", "Grey"),
                Map.entry("mileage", 1200),
                Map.entry("fuelType", "GASOLINE"),
                Map.entry("seatingCapacity", 5),
                Map.entry("dailyRate", 80),
                Map.entry("gpsEnabled", true),
                Map.entry("lastMaintenanceDate", "2026-01-01"),
                Map.entry("maintenanceIntervalDays", 365));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> dataField(ExecutionResult result, String field) {
        return (Map<String, Object>) ((Map<String, Object>) result.getData()).get(field);
    }
}
