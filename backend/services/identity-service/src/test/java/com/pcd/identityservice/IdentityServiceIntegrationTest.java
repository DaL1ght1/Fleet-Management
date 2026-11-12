package com.pcd.identityservice;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dasniko.testcontainers.keycloak.KeycloakContainer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.client.RestClient;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.kafka.ConfluentKafkaContainer;
import org.testcontainers.utility.MountableFile;

import java.nio.file.Path;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "smartstreet.security.router-secret=test-secret",
        "smartstreet.identity.client-secret=" + IdentityServiceIntegrationTest.CLIENT_SECRET,
        "smartstreet.identity.secure-cookies=false",
        "smartstreet.outbox.poll-interval=100ms"
})
class IdentityServiceIntegrationTest {

    static final String CLIENT_SECRET = "integration-client-secret";
    private static final Pattern TOKEN_IN_LINK = Pattern.compile("token=([A-Za-z0-9_-]+)");
    private static final Path REALM = Path.of("../../../deploy/keycloak/import/Smart-Street-realm.json");

    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @ServiceConnection
    static final ConfluentKafkaContainer KAFKA = new ConfluentKafkaContainer("confluentinc/cp-kafka:7.5.1");

    static final KeycloakContainer KEYCLOAK = new KeycloakContainer("quay.io/keycloak/keycloak:26.7.4")
            .withEnv("IDENTITY_CLIENT_SECRET", CLIENT_SECRET)
            .withCopyFileToContainer(MountableFile.forHostPath(REALM), "/opt/keycloak/data/import/Smart-Street-realm.json");

    static final GenericContainer<?> MAILPIT = new GenericContainer<>("axllent/mailpit:v1.27")
            .withExposedPorts(1025, 8025);

    @BeforeAll
    static void startInfrastructure() {
        POSTGRES.start();
        KAFKA.start();
        KEYCLOAK.start();
        MAILPIT.start();
    }

    @AfterAll
    static void stopInfrastructure() {
        MAILPIT.stop();
        KEYCLOAK.stop();
    }

    @DynamicPropertySource
    static void infrastructure(DynamicPropertyRegistry registry) {
        registry.add("smartstreet.identity.keycloak-url", KEYCLOAK::getAuthServerUrl);
        registry.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri",
                () -> KEYCLOAK.getAuthServerUrl() + "/realms/Smart-Street/protocol/openid-connect/certs");
        registry.add("spring.mail.host", MAILPIT::getHost);
        registry.add("spring.mail.port", () -> MAILPIT.getMappedPort(1025));
    }

    @LocalServerPort
    private int port;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void customersSignUpManageTheirProfileAndRecoverTheirPassword() throws Exception {
        ResponseEntity<JsonNode> signUp = post("/auth/sign-up", Map.of("email", "Leila@Example.com",
                "firstName", "Leila", "lastName", "Trabelsi", "password", "secret123"), null);
        assertThat(signUp.getStatusCode().value()).isEqualTo(201);
        String accessToken = signUp.getBody().path("accessToken").asText();
        String cookie = sessionCookie(signUp);

        JsonNode me = get("/auth/me", accessToken).getBody();
        assertThat(me.path("email").asText()).isEqualTo("leila@example.com");
        assertThat(me.path("roles").toString()).contains("USER");

        ResponseEntity<JsonNode> refreshed = post("/auth/refresh", Map.of(), cookie);
        assertThat(refreshed.getStatusCode().value()).isEqualTo(200);
        assertThat(refreshed.getBody().path("accessToken").asText()).isNotBlank();

        ResponseEntity<JsonNode> updated = put("/auth/me", Map.of("email", "leila@example.com",
                "firstName", "Leïla", "lastName", "Ben Ali"), accessToken);
        assertThat(updated.getBody().path("lastName").asText()).isEqualTo("Ben Ali");

        assertThat(post("/auth/password/forgot", Map.of("email", "leila@example.com"), null)
                .getStatusCode().value()).isEqualTo(202);
        String token = await().atMost(Duration.ofSeconds(20)).until(this::latestTokenFromMail, Objects::nonNull);
        assertThat(post("/auth/password/reset", Map.of("token", token, "password", "brandNew42"), null)
                .getStatusCode().value()).isEqualTo(204);
        assertThat(post("/auth/password/reset", Map.of("token", token, "password", "again42aa"), null)
                .getStatusCode().value()).isEqualTo(422);

        assertThat(post("/auth/sign-in", Map.of("email", "leila@example.com", "password", "secret123"), null)
                .getStatusCode().value()).isEqualTo(401);
        assertThat(post("/auth/sign-in", Map.of("email", "leila@example.com", "password", "brandNew42"), null)
                .getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void weakPasswordsAndDuplicateEmailsAreRejected() {
        assertThat(post("/auth/sign-up", Map.of("email", "weak@example.com", "firstName", "Weak",
                "lastName", "Password", "password", "short"), null).getStatusCode().value()).isEqualTo(400);
        assertThat(post("/auth/sign-up", Map.of("email", "fleet-admin@smartstreet.local", "firstName", "Dup",
                "lastName", "Licate", "password", "secret123"), null).getStatusCode().value()).isEqualTo(409);
    }

    @Test
    void managersInviteStaffWhoActivateTheirAccount() throws Exception {
        String managerToken = post("/auth/sign-in", Map.of("email", "fleet-manager@smartstreet.local",
                "password", "manager12345"), null).getBody().path("accessToken").asText();

        ResponseEntity<JsonNode> invited = post("/auth/invitations", Map.of("email", "new.driver@example.com",
                "firstName", "Youssef", "lastName", "Driver", "role", "DRIVER"), managerToken);
        assertThat(invited.getStatusCode().value()).isEqualTo(201);

        String customerToken = post("/auth/sign-in", Map.of("email", "customer@smartstreet.local",
                "password", "customer12345"), null).getBody().path("accessToken").asText();
        assertThat(post("/auth/invitations", Map.of("email", "x@example.com", "firstName", "X",
                "lastName", "Y", "role", "ADMIN"), customerToken).getStatusCode().value()).isEqualTo(403);

        String token = await().atMost(Duration.ofSeconds(20)).until(this::latestTokenFromMail, Objects::nonNull);
        assertThat(post("/auth/password/reset", Map.of("token", token, "password", "driveSafe7"), null)
                .getStatusCode().value()).isEqualTo(204);
        ResponseEntity<JsonNode> signIn = post("/auth/sign-in", Map.of("email", "new.driver@example.com",
                "password", "driveSafe7"), null);
        assertThat(signIn.getStatusCode().value()).isEqualTo(200);
    }

    private String latestTokenFromMail() throws Exception {
        RestClient mailpit = RestClient.create("http://" + MAILPIT.getHost() + ":" + MAILPIT.getMappedPort(8025));
        JsonNode messages = objectMapper.readTree(mailpit.get().uri("/api/v1/messages").retrieve().body(String.class));
        if (messages.path("messages").isEmpty()) {
            return null;
        }
        String id = messages.path("messages").get(0).path("ID").asText();
        JsonNode message = objectMapper.readTree(mailpit.get().uri("/api/v1/message/" + id).retrieve().body(String.class));
        mailpit.delete().uri("/api/v1/messages").retrieve().toBodilessEntity();
        Matcher matcher = TOKEN_IN_LINK.matcher(message.path("Text").asText());
        return matcher.find() ? matcher.group(1) : null;
    }

    private static String sessionCookie(ResponseEntity<?> response) {
        String header = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(header).contains("ss_session=").contains("HttpOnly").contains("SameSite=Strict");
        return header.substring(0, header.indexOf(';'));
    }

    private ResponseEntity<JsonNode> post(String path, Object body, String tokenOrCookie) {
        return client().post().uri(path).contentType(MediaType.APPLICATION_JSON).body(body)
                .headers(headers -> authenticate(headers, tokenOrCookie))
                .exchange((request, response) -> ResponseEntity.status(response.getStatusCode())
                        .headers(response.getHeaders()).body(readBody(response.getBody().readAllBytes())));
    }

    private ResponseEntity<JsonNode> put(String path, Object body, String token) {
        return client().put().uri(path).contentType(MediaType.APPLICATION_JSON).body(body)
                .headers(headers -> authenticate(headers, token))
                .exchange((request, response) -> ResponseEntity.status(response.getStatusCode())
                        .body(readBody(response.getBody().readAllBytes())));
    }

    private ResponseEntity<JsonNode> get(String path, String token) {
        return client().get().uri(path).headers(headers -> authenticate(headers, token))
                .exchange((request, response) -> ResponseEntity.status(response.getStatusCode())
                        .body(readBody(response.getBody().readAllBytes())));
    }

    private static void authenticate(HttpHeaders headers, String tokenOrCookie) {
        if (tokenOrCookie == null) {
            return;
        }
        if (tokenOrCookie.startsWith("ss_session=")) {
            headers.add(HttpHeaders.COOKIE, tokenOrCookie);
        } else {
            headers.setBearerAuth(tokenOrCookie);
        }
    }

    private JsonNode readBody(byte[] body) throws java.io.IOException {
        return body.length == 0 ? objectMapper.createObjectNode() : objectMapper.readTree(body);
    }

    private RestClient client() {
        return RestClient.create("http://localhost:" + port);
    }
}
