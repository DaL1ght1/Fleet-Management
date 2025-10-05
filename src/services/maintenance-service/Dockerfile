FROM maven:3.9.11-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY src/pom.xml ./pom.xml

WORKDIR /app/services/shared
COPY src/services/shared/pom.xml ./pom.xml
COPY src/services/shared/src ./src
RUN mvn -q -DskipTests install

WORKDIR /app/services/maintenance-service
COPY src/services/maintenance-service/pom.xml ./pom.xml
COPY src/services/maintenance-service/src ./src
RUN mvn -q -DskipTests dependency:go-offline
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
EXPOSE 8120
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"
COPY --from=builder /app/services/maintenance-service/target/maintenance-service-1.0.jar app.jar
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
