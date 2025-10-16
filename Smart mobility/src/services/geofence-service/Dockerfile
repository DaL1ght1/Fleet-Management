FROM maven:3.9.11-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy parent and module POMs so Maven can resolve the multi-module build
COPY src/pom.xml ./pom.xml
# apparently, shared is needed so i install it in a separate folder (sibling)
WORKDIR /app/services/shared
COPY src/services/shared/pom.xml ./pom.xml
COPY src/services/shared/src ./src
RUN mvn -q -DskipTests install

# main service
WORKDIR /app/services/geofence-service
COPY src/services/geofence-service/pom.xml ./pom.xml
COPY src/services/geofence-service/src ./src
RUN mvn -q -DskipTests dependency:go-offline
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
EXPOSE 8130

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"
COPY --from=builder /app/services/geofence-service/target/geofence-service-1.0.jar app.jar
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
