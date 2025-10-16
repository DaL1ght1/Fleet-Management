FROM maven:3.9.11-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY src/pom.xml ./pom.xml

WORKDIR /app/services/shared
COPY src/services/shared/pom.xml ./pom.xml
COPY src/services/shared/src ./src
RUN mvn -q -DskipTests install

WORKDIR /app/services/billing-service
COPY src/services/billing-service/pom.xml ./pom.xml
COPY src/services/billing-service/src ./src
RUN mvn -q -DskipTests dependency:go-offline
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
EXPOSE 8140
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"
COPY --from=builder /app/services/billing-service/target/billing-service-1.0.jar app.jar
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
