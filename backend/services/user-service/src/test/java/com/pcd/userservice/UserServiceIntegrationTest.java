package com.pcd.userservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import com.pcd.userservice.infrastructure.persistence.DriverRepository;
import graphql.ExecutionResult;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.mapping.AbstractJavaTypeMapper;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = {
        "smartstreet.security.router-secret=test-secret",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost/certs",
        "smartstreet.outbox.poll-interval=100ms"
})
class UserServiceIntegrationTest {


    private static final String REGISTER_DRIVER = """
            mutation Register($input: RegisterDriverInput!) {
              registerDriver(input: $input) { id fullName email available licenseExpired emergencyContact { name } }
            }
            """;
    private static final String DRIVER = "query Driver($id: UUID!) { driver(id: $id) { available completedTrips } }";

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private DriverRepository drivers;

    @Test
    @WithMockUser(roles = "MANAGER")
    void driversBecomeBusyDuringTripsAndCountCompletedTrips() throws Exception {
        ExecutionResult registration = graphql.execute(REGISTER_DRIVER, Map.of("input", driverInput("A-1001")));

        assertThat(registration.getErrors()).isEmpty();
        Map<String, Object> driver = dataField(registration, "registerDriver");
        UUID driverId = UUID.fromString((String) driver.get("id"));
        assertThat(driver).containsEntry("fullName", "Amine Ben Salah").containsEntry("available", true);

        UUID tripId = UUID.randomUUID();
        sendTripEvent(TripEvent.Type.TRIP_STARTED, tripId, driverId);
        await().atMost(Duration.ofSeconds(30)).until(() -> drivers.findById(driverId).orElseThrow().isOnTrip());
        assertThat(dataField(graphql.execute(DRIVER, Map.of("id", driverId.toString())), "driver"))
                .containsEntry("available", false);

        sendTripEvent(TripEvent.Type.TRIP_COMPLETED, tripId, driverId);
        await().atMost(Duration.ofSeconds(30)).until(() -> !drivers.findById(driverId).orElseThrow().isOnTrip());
        assertThat(dataField(graphql.execute(DRIVER, Map.of("id", driverId.toString())), "driver"))
                .containsEntry("completedTrips", 1);
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void duplicateLicensesAreRejected() {
        graphql.execute(REGISTER_DRIVER, Map.of("input", driverInput("B-2002")));

        Map<String, Object> duplicate = new java.util.HashMap<>(driverInput("b-2002"));
        duplicate.put("email", "other@example.com");
        ExecutionResult result = graphql.execute(REGISTER_DRIVER, Map.of("input", duplicate));

        assertThat(result.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).contains("already registered"));
    }

    private void sendTripEvent(TripEvent.Type type, UUID tripId, UUID driverId) throws Exception {
        TripEvent event = new TripEvent(UUID.randomUUID(), type, Instant.now(), tripId, UUID.randomUUID(), driverId, null,
                TripEvent.Kind.RENTAL, TripEvent.Status.IN_PROGRESS, null, null, null, null, null, null, null);
        ProducerRecord<String, String> record = new ProducerRecord<>(Topics.TRIP_EVENTS, tripId.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                TripEvent.class.getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }

    private static Map<String, Object> driverInput(String license) {
        return Map.of(
                "firstName", "Amine",
                "lastName", "Ben Salah",
                "email", license.toLowerCase() + "@example.com",
                "phoneNumber", "+216 20 123 456",
                "licenseNumber", license,
                "licenseExpiryDate", "2030-01-01",
                "emergencyContact", Map.of("name", "Sarra", "phoneNumber", "+216 98 765 432"));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> dataField(ExecutionResult result, String field) {
        return (Map<String, Object>) ((Map<String, Object>) result.getData()).get(field);
    }
}
