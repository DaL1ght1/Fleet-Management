FROM maven:3.9.11-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY src/pom.xml ./pom.xml

WORKDIR /app/services/shared
COPY src/services/shared/pom.xml ./pom.xml
COPY src/services/shared/src ./src
RUN mvn -q -DskipTests install

WORKDIR /app/services/telemetry-ingest
COPY src/services/telemetry-ingest/pom.xml ./pom.xml
COPY src/services/telemetry-ingest/src ./src
RUN mvn -q -DskipTests dependency:go-offline
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
EXPOSE 8110
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"
RUN addgroup -S spring && adduser -S -G spring -u 1001 -s /sbin/nologin spring
COPY --from=builder /app/services/telemetry-ingest/target/telemetry-ingest-1.0.jar app.jar
USER spring
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
