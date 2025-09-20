# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Smart Mobility platform built as a microservices architecture using:
- **Backend Framework**: Spring Boot 3.5+ with Java 21
- **GraphQL**: Apollo Federation v2.6 with Netflix DGS Framework
- **Database**: PostgreSQL with JPA/Hibernate
- **Message Broker**: Apache Kafka for event-driven communication
- **Authentication**: Keycloak with OAuth2/JWT
- **Containerization**: Docker and Docker Compose
- **Gateway**: Apollo Router for GraphQL federation

## Architecture

### Microservices Structure
The system follows a federated GraphQL architecture with these core services:

1. **user-service** (Port 8090) - User management and authentication
2. **vehicles-service** (Port 8080) - Vehicle fleet management
3. **trips-service** (Port 8101) - Trip orchestration and management
4. **api-gateway** (Port 4000) - Apollo Router GraphQL gateway
5. **telemetry-ingest** (Port 8110) - Vehicle telemetry data ingestion
6. **maintenance-service** (Port 8120) - Vehicle maintenance scheduling
7. **geofence-service** (Port 8130) - Location and geofencing
8. **billing-service** (Port 8140) - Payment and billing management
9. **notifications-service** - Push notifications and alerts

### Key Patterns
- **GraphQL Federation**: Services expose federated GraphQL schemas that are composed via Apollo Router
- **Event-Driven Architecture**: Services communicate via Kafka topics with shared event classes
- **Shared Configuration**: Common Kafka config and event models in `services/shared/`
- **Entity Federation**: Cross-service data resolution (e.g., Trip references User and Vehicle entities)

### Infrastructure Services
- **PostgreSQL** (Port 5432) - Primary database
- **Kafka + Zookeeper** (Port 9092) - Event streaming
- **Redis** (Port 6379) - Caching layer  
- **Keycloak** (Port 8083) - Identity and access management
- **Nginx** (Port 8084) - Reverse proxy and static content

## Development Commands

### Environment Setup
```powershell
# Start all infrastructure services
docker-compose -f deploy/docker-compose.yml up -d postgresql kafka redis keycloak

# Start specific services for development
docker-compose -f deploy/docker-compose.yml up -d user-service vehicles-service trips-service api-gateway
```

### Building Services
```powershell
# Build a single service
cd services/user-service
./mvnw clean install

# Build all services (run from services directory)
Get-ChildItem -Directory | ForEach-Object { cd $_.Name; ./mvnw clean install; cd .. }
```

### Testing
```powershell
# Run tests for a specific service
cd services/user-service
./mvnw test

# Run specific test class
./mvnw test -Dtest=UserServiceTest

# Run tests with coverage
./mvnw test jacoco:report
```

### GraphQL Development
```powershell
# Generate GraphQL code from schema (user-service example)
cd services/user-service
./mvnw io.github.deweyjose:graphqlcodegen-maven-plugin:generate

# Update supergraph schema after schema changes
cd services/api-gateway
# Update individual service schemas in supergraph.yaml, then regenerate
```

### Local Service Development
```powershell
# Run service locally (connects to Docker infrastructure)
cd services/user-service
./mvnw spring-boot:run

# Run with different profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Kafka Operations
```powershell
# View Kafka topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# Consume messages from a topic
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic smart-mobility.user.events --from-beginning
```

### Database Operations
```powershell
# Connect to PostgreSQL
docker exec -it postgres psql -U admin -d smarts

# Run database migrations (if using Flyway)
cd services/user-service
./mvnw flyway:migrate
```

## Service-Specific Details

### GraphQL Federation
- Each service defines its own GraphQL schema with `@key` directives for federated entities
- The `api-gateway` composes all schemas into a supergraph
- Cross-service resolution happens automatically (Trip → User, Trip → Vehicle)
- Test federation queries are available in `test-queries/federation-test-queries.graphql`

### Authentication Flow
- Keycloak provides JWT tokens
- Apollo Router validates JWT and extracts user context
- Headers are propagated to services: `x-user-id`, `x-user-roles`, `Authorization`
- Services use `@PreAuthorize` for method-level security

### Event-Driven Communication
- Services publish domain events to Kafka topics
- Shared event classes in `services/shared/events/`
- Topic names: `smart-mobility.{domain}.events`
- Events include: USER_CREATED, VEHICLE_STATUS_UPDATED, TRIP_COMPLETED

### Service Dependencies
- **trips-service** depends on user-service and vehicles-service for federation
- **All services** depend on PostgreSQL and Kafka
- **api-gateway** depends on all active GraphQL services

## Common Development Patterns

### Adding a New Microservice
1. Copy structure from existing service (e.g., `user-service`)
2. Update `pom.xml` with correct artifactId and dependencies
3. Define GraphQL schema with federation directives
4. Add service to `docker-compose.yml`
5. Update `supergraph.yaml` in api-gateway
6. Regenerate supergraph schema

### Adding GraphQL Fields
1. Update schema file in `src/main/resources/schema/schema.graphql`
2. Run code generation: `./mvnw io.github.deweyjose:graphqlcodegen-maven-plugin:generate`
3. Implement resolvers using `@DgsQuery`, `@DgsMutation`, or `@DgsData`
4. Update supergraph if adding federated fields

### Adding Kafka Events
1. Define event class in `services/shared/events/`
2. Use `KafkaTemplate` to publish events
3. Use `@KafkaListener` to consume events
4. Events should include `correlationId` for tracing

## Port Allocation
- **GraphQL Gateway**: 4000
- **User Service**: 8090  
- **Vehicles Service**: 8080
- **Trips Service**: 8101
- **Telemetry Ingest**: 8110
- **Maintenance Service**: 8120
- **Geofence Service**: 8130
- **Billing Service**: 8140
- **Infrastructure**:
  - PostgreSQL: 5432
  - Kafka: 9092
  - Redis: 6379
  - Keycloak: 8083
  - Nginx: 8084

## Environment Variables
Services expect these standard environment variables:
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`: Kafka broker addresses  
- `SPRING_APPLICATION_NAME`: Service name for Kafka consumer groups
- Authentication is handled by Apollo Router, not individual services

## Debugging and Monitoring
- **GraphQL Playground**: http://localhost:4000 (Apollo Router)
- **Keycloak Admin**: http://localhost:8083 (admin/admin)
- **Service Health**: Each service exposes `/actuator/health`
- **Metrics**: Prometheus metrics at Apollo Router port 9090
- **Logs**: Use `docker-compose logs <service-name>` for containerized services