# ---------- Stage 1: build the fat JAR ----------
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /workspace

# 1) Copy only pom.xml first to warm the dependency cache
COPY pom.xml .
RUN mvn -q -B -e -DskipTests dependency:go-offline

# 2) Copy the rest of the source and build
COPY src ./src
RUN mvn -q -B -DskipTests package

# ---------- Stage 2: run the app (slim JRE) ----------
FROM eclipse-temurin:21-jre

# 3) Create a non-root user for security
RUN useradd -r -u 1001 spring
WORKDIR /app

# 4) Copy the built JAR from the builder stage
COPY --from=builder /workspace/target/*.jar /app/app.jar

# 5) Expose the container port your app listens on (informational)
EXPOSE 8080

# 7) Memory- & container-friendly JVM flags
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"

# 8) Drop privileges and run
USER spring
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
