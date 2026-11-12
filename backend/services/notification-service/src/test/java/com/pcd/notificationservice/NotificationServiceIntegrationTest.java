package com.pcd.notificationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.pcd.notificationservice.infrastructure.persistence.KnownVehicleRepository;
import com.pcd.notificationservice.infrastructure.persistence.NotificationRepository;
import com.pcd.notificationservice.infrastructure.persistence.RecipientRepository;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.GeofenceEvent;
import com.pcd.shared.events.InvoiceEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.events.VehicleEvent;
import graphql.ExecutionResult;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.AfterEach;
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
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@TestPropertySource(properties = {
        "smartstreet.security.router-secret=test-secret",
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost/certs"
})
class NotificationServiceIntegrationTest {

    @Autowired
    private DgsQueryExecutor graphql;
    @Autowired
    private KafkaTemplate<String, String> kafka;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private NotificationRepository notifications;
    @Autowired
    private KnownVehicleRepository vehicles;
    @Autowired
    private RecipientRepository recipients;

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void staffSeeFleetAlertsAndCustomersOnlySeeTheirOwnInvoices() throws Exception {
        UUID vehicleId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID customerAccount = UUID.randomUUID();
        send(Topics.VEHICLE_EVENTS, vehicleId, new VehicleEvent(UUID.randomUUID(),
                VehicleEvent.Type.VEHICLE_REGISTERED, Instant.now(), vehicleId, "123 TU 4567", "Renault", "Clio",
                VehicleEvent.Status.ACTIVE, 1000L, null));
        send(Topics.CUSTOMER_EVENTS, customerId, new CustomerEvent(UUID.randomUUID(),
                CustomerEvent.Type.CUSTOMER_REGISTERED, Instant.now(), customerId, customerAccount, "Sarra",
                "Ben Ali", "sarra@example.com"));
        await().atMost(Duration.ofSeconds(30)).until(() -> vehicles.existsById(vehicleId)
                && recipients.existsById(customerId));
        send(Topics.GEOFENCE_EVENTS, vehicleId, new GeofenceEvent(UUID.randomUUID(),
                GeofenceEvent.Type.SPEED_LIMIT_EXCEEDED, Instant.now(), UUID.randomUUID(), UUID.randomUUID(),
                "Downtown", vehicleId, GeofenceEvent.Severity.CRITICAL, 36.8, 10.18, 92.4, 50.0));
        send(Topics.BILLING_EVENTS, customerId, new InvoiceEvent(UUID.randomUUID(),
                InvoiceEvent.Type.INVOICE_ISSUED, Instant.now(), UUID.randomUUID(), "INV-2030-000007",
                UUID.randomUUID(), customerId, new BigDecimal("178.5"), LocalDate.now().plusDays(30)));
        await().atMost(Duration.ofSeconds(30)).until(() -> notifications.count() >= 2);

        signIn(UUID.randomUUID(), "ROLE_MANAGER");
        ExecutionResult staff = graphql.execute(
                "{ myNotifications { totalCount items { kind severity read params { key value } } } }");
        assertThat(staff.getErrors()).isEmpty();
        assertThat(staff.getData().toString()).contains("SPEED_LIMIT_EXCEEDED").contains("CRITICAL")
                .contains("123 TU 4567").doesNotContain("INVOICE_ISSUED");

        signIn(customerAccount, "ROLE_USER");
        assertThat(graphql.<Integer>executeAndExtractJsonPath("{ unreadNotificationCount }",
                "data.unreadNotificationCount")).isEqualTo(1);
        assertThat(graphql.<Integer>executeAndExtractJsonPath("mutation { markAllNotificationsRead }",
                "data.markAllNotificationsRead")).isEqualTo(1);
        assertThat(graphql.<Integer>executeAndExtractJsonPath("{ unreadNotificationCount }",
                "data.unreadNotificationCount")).isZero();
    }

    private void signIn(UUID accountId, String role) {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").subject(accountId.toString()).build();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(jwt, null,
                List.of(new SimpleGrantedAuthority(role))));
    }

    private void send(String topic, UUID key, Object event) throws Exception {
        ProducerRecord<String, String> record = new ProducerRecord<>(topic, key.toString(),
                objectMapper.writeValueAsString(event));
        record.headers().add(AbstractJavaTypeMapper.DEFAULT_CLASSID_FIELD_NAME,
                event.getClass().getName().getBytes(StandardCharsets.UTF_8));
        kafka.send(record).get();
    }
}
