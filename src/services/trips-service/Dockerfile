# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy everything needed for the build
COPY . .

# Build only the trips-service module
RUN mvn clean package -pl services/trips-service -am -DskipTests

# Stage 2: Create the final image
FROM eclipse-temurin:21-jre

# 1) Create a non-root user for security
RUN useradd -r -u 1001 spring
WORKDIR /app

# 2) Copy the pre-built JAR from the builder stage
COPY --from=builder /app/services/trips-service/target/*.jar /app/app.jar

# 3) Expose the container port your app listens on (informational)
EXPOSE 8080

# 4) Memory- & container-friendly JVM flags
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"

# 5) Drop privileges and run
USER spring
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
