package com.pcd.maintenanceservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.maintenanceservice.domain.WorkOrderKind;
import com.pcd.maintenanceservice.infrastructure.persistence.WorkOrderRepository;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
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
import java.time.LocalDate;
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
class MaintenanceServiceIntegrationTest {

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private WorkOrderRepository workOrders;

    @Test
    @WithMockUser(roles = "MANAGER")
    void vehiclesDueForServiceGetAPreventiveWorkOrderThatCanBeCompleted() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        announce(vehicleId, LocalDate.now().plusDays(3));
        await().atMost(Duration.ofSeconds(30)).until(() ->
                workOrders.existsByVehicleIdAndKindAndStatusIn(vehicleId, WorkOrderKind.PREVENTIVE,
                        com.pcd.maintenanceservice.domain.WorkOrder.OPEN));
        String id = workOrders.findByVehicleIdOrderByScheduledForDesc(vehicleId).getFirst().getId().toString();

        assertThat(graphql.execute("mutation($id: UUID!) { startWorkOrder(id: $id) { status } }",
                Map.of("id", id)).getErrors()).isEmpty();
        ExecutionResult completed = graphql.execute("""
                mutation($id: UUID!) {
                  completeWorkOrder(id: $id, input: { partsCost: 120, laborCost: 45.5 }) { status totalCost }
                }
                """, Map.of("id", id));

        assertThat(completed.getErrors()).isEmpty();
        assertThat(completed.getData().toString()).contains("COMPLETED").contains("165.5");
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void workOrdersForUnknownVehiclesAreRejected() {
        ExecutionResult result = graphql.execute("""
                mutation($vehicleId: UUID!) {
                  scheduleWorkOrder(input: { vehicleId: $vehicleId, kind: REPAIR, priority: HIGH,
                    title: "Brakes", scheduledFor: "2030-01-01" }) { id }
                }
                """, Map.of("vehicleId", UUID.randomUUID().toString()));

        assertThat(result.getErrors()).singleElement()
                .satisfies(error -> assertThat(error.getMessage()).contains("is unknown"));
    }

    private void announce(UUID vehicleId, LocalDate nextMaintenance) throws Exception {
        VehicleEvent event = new VehicleEvent(UUID.randomUUID(), VehicleEvent.Type.VEHICLE_REGISTERED, Instant.now(),
                vehicleId, "100 TU 2000", "Renault", "Clio", VehicleEvent.Status.ACTIVE, 9000L, nextMaintenance);
        ProducerRecord<String, String> record = new ProducerRecord<>(Topics.VEHICLE_EVENTS, vehicleId.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                VehicleEvent.class.getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }
}
