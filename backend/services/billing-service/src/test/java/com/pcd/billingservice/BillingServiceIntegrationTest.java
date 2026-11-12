package com.pcd.billingservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.billingservice.infrastructure.persistence.ExpenseRepository;
import com.pcd.billingservice.infrastructure.persistence.InvoiceRepository;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.DriverEvent;
import com.pcd.shared.events.MaintenanceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.TripEvent;
import graphql.ExecutionResult;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.mapping.AbstractJavaTypeMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
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
class BillingServiceIntegrationTest {

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private InvoiceRepository invoices;
    @Autowired
    private ExpenseRepository expenses;

    @Test
    @WithMockUser(roles = "MANAGER")
    void completedTripsAreInvoicedAndCustomersSeeTheirIssuedInvoices() throws Exception {
        UUID tripId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        send(Topics.CUSTOMER_EVENTS, customerId, new CustomerEvent(UUID.randomUUID(),
                CustomerEvent.Type.CUSTOMER_REGISTERED, Instant.now(), customerId, accountId, "Sarra", "Ben Ali",
                "sarra@example.com"));
        send(Topics.TRIP_EVENTS, tripId, new TripEvent(UUID.randomUUID(), TripEvent.Type.TRIP_COMPLETED,
                Instant.now(), tripId, UUID.randomUUID(), null, customerId, TripEvent.Kind.RENTAL,
                TripEvent.Status.COMPLETED, null, null, null, Instant.now(), new BigDecimal("120.4"),
                new BigDecimal("150"), null));

        await().atMost(Duration.ofSeconds(30)).until(() -> invoices.existsByTripId(tripId));
        String id = invoices.findByTripId(tripId).orElseThrow().getId().toString();

        ExecutionResult issued = graphql.execute(
                "mutation($id: UUID!) { issueInvoice(id: $id) { status total number dueDate } }", Map.of("id", id));
        assertThat(issued.getErrors()).isEmpty();
        assertThat(issued.getData().toString()).contains("ISSUED").contains("178.5");

        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").subject(accountId.toString()).build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(jwt, null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))));
        ExecutionResult mine = graphql.execute("{ myInvoices { totalCount items { number } } }");
        assertThat(mine.getErrors()).isEmpty();
        assertThat(mine.getData().toString()).contains("totalCount=1");
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void completedWorkOrdersAndDriverSalariesBecomeExpensesThatCanBePaid() throws Exception {
        UUID workOrderId = UUID.randomUUID();
        UUID driverId = UUID.randomUUID();
        send(Topics.MAINTENANCE_EVENTS, workOrderId, new MaintenanceEvent(UUID.randomUUID(),
                MaintenanceEvent.Type.WORK_ORDER_COMPLETED, Instant.now(), workOrderId, UUID.randomUUID(),
                MaintenanceEvent.Kind.REPAIR, "Replace brake pads", LocalDate.now(), LocalDate.now(),
                new BigDecimal("420.5")));
        send(Topics.DRIVER_EVENTS, driverId, new DriverEvent(UUID.randomUUID(), DriverEvent.Type.DRIVER_REGISTERED,
                Instant.now(), driverId, null, "Amine", "Driver", "amine@example.com", DriverEvent.Status.ACTIVE,
                LocalDate.now().plusYears(2), LocalDate.now().minusDays(95), new BigDecimal("1800")));

        await().atMost(Duration.ofSeconds(30)).until(() -> expenses.count() >= 2);

        ExecutionResult statistics = graphql.execute(
                "{ expenseStatistics { maintenanceUnpaid salariesUnpaid unpaidCount } upcomingSalaries { payday amount } }");
        assertThat(statistics.getErrors()).isEmpty();
        assertThat(statistics.getData().toString())
                .contains("maintenanceUnpaid=420.5")
                .contains("salariesUnpaid=1800")
                .contains("unpaidCount=2")
                .contains(LocalDate.now().minusDays(95).plusDays(120).toString());

        String expenseId = graphql.executeAndExtractJsonPath(
                "{ expenses(filter: { kind: MAINTENANCE }) { items { id } } }", "data.expenses.items[0].id");
        ExecutionResult paid = graphql.execute(
                "mutation($id: UUID!) { payExpense(id: $id, method: BANK_TRANSFER) { status paidOn } }",
                Map.of("id", expenseId));
        assertThat(paid.getErrors()).isEmpty();
        assertThat(paid.getData().toString()).contains("PAID");
    }

    private void send(String topic, UUID key, Object event) throws Exception {
        ProducerRecord<String, String> record = new ProducerRecord<>(topic, key.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                event.getClass().getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }
}
