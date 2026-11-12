package com.pcd.tripsservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.shared.events.VehicleEvent;
import com.pcd.tripsservice.infrastructure.persistence.FleetResourceRepository;
import graphql.ExecutionResult;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.producer.ProducerRecord;
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
class TripsServiceIntegrationTest {

    @Autowired
    private ConfluentKafkaContainer kafkaContainer;

    private static final String SCHEDULE_TRIP = """
            mutation Schedule($input: ScheduleTripInput!) {
              scheduleTrip(input: $input) { id status vehicle { id } driver { id } scheduledStart costs { totalCost } }
            }
            """;

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private FleetResourceRepository fleetResources;

    @Test
    @WithMockUser(roles = "MANAGER")
    void schedulesATripForAvailableResourcesAndPublishesTheEvent() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        UUID driverId = UUID.randomUUID();
        Instant now = Instant.now();
        send(Topics.VEHICLE_EVENTS, vehicleId, new VehicleEvent(UUID.randomUUID(), VehicleEvent.Type.VEHICLE_REGISTERED,
                now, vehicleId, "123 TU 4567", "Toyota", "Corolla", VehicleEvent.Status.ACTIVE, 1000L, null));
        send(Topics.DRIVER_EVENTS, driverId, new DriverEvent(UUID.randomUUID(), DriverEvent.Type.DRIVER_REGISTERED,
                now, driverId, null, "Amine", "Ben Salah", "amine@example.com", DriverEvent.Status.ACTIVE, null, null, null));
        await().atMost(Duration.ofSeconds(30)).until(() ->
                fleetResources.existsById(vehicleId) && fleetResources.existsById(driverId));

        ExecutionResult result = graphql.execute(SCHEDULE_TRIP, Map.of("input", scheduleInput(vehicleId, driverId)));

        assertThat(result.getErrors()).isEmpty();
        Map<String, Object> trip = dataField(result, "scheduleTrip");
        assertThat(trip).containsEntry("status", "SCHEDULED");
        assertThat(trip.get("vehicle")).isEqualTo(Map.of("id", vehicleId.toString()));
        assertThat(trip.get("driver")).isEqualTo(Map.of("id", driverId.toString()));
        assertThat(Instant.parse((String) trip.get("scheduledStart"))).isEqualTo(Instant.parse("2030-03-01T08:00:00Z"));
        assertTripEventPublished(UUID.fromString((String) trip.get("id")));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void rejectsTripsForUnknownVehicles() {
        ExecutionResult result = graphql.execute(SCHEDULE_TRIP,
                Map.of("input", scheduleInput(UUID.randomUUID(), null)));

        assertThat(result.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).contains("is unknown"));
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void driversCannotScheduleTrips() {
        ExecutionResult result = graphql.execute(SCHEDULE_TRIP,
                Map.of("input", scheduleInput(UUID.randomUUID(), null)));

        assertThat(result.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).isEqualTo("Access denied"));
    }

    private void assertTripEventPublished(UUID tripId) throws Exception {
        try (Consumer<String, String> consumer = new DefaultKafkaConsumerFactory<String, String>(
                KafkaTestUtils.consumerProps(kafkaContainer.getBootstrapServers(), "trip-events-test", "true"),
                new org.apache.kafka.common.serialization.StringDeserializer(),
                new org.apache.kafka.common.serialization.StringDeserializer()).createConsumer()) {
            consumer.subscribe(List.of(Topics.TRIP_EVENTS));
            ConsumerRecord<String, String> record = await().atMost(Duration.ofSeconds(30))
                    .until(() -> firstFor(consumer.poll(Duration.ofMillis(500)), tripId), java.util.Objects::nonNull);
            TripEvent event = objectMapper.readValue(record.value(), TripEvent.class);
            assertThat(event.type()).isEqualTo(TripEvent.Type.TRIP_SCHEDULED);
            assertThat(new String(record.headers().lastHeader(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME).value(),
                    StandardCharsets.UTF_8)).isEqualTo(TripEvent.class.getName());
        }
    }

    private static ConsumerRecord<String, String> firstFor(ConsumerRecords<String, String> records, UUID tripId) {
        return StreamSupport.stream(records.spliterator(), false)
                .filter(record -> record.key().equals(tripId.toString()))
                .findFirst()
                .orElse(null);
    }

    private void send(String topic, UUID key, Object event) throws Exception {
        ProducerRecord<String, String> record = new ProducerRecord<>(topic, key.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                event.getClass().getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }

    private static Map<String, Object> scheduleInput(UUID vehicleId, UUID driverId) {
        Map<String, Object> location = Map.of("latitude", 36.8, "longitude", 10.18, "address", "Tunis Centre");
        java.util.HashMap<String, Object> input = new java.util.HashMap<>(Map.of(
                "type", "RENTAL",
                "vehicleId", vehicleId.toString(),
                "startLocation", location,
                "endLocation", location,
                "scheduledStart", "2030-03-01T08:00:00Z",
                "scheduledEnd", "2030-03-01T11:00:00Z",
                "costs", Map.of("baseRate", 120)));
        if (driverId != null) {
            input.put("driverId", driverId.toString());
        }
        return input;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> dataField(ExecutionResult result, String field) {
        return (Map<String, Object>) ((Map<String, Object>) result.getData()).get(field);
    }
}
