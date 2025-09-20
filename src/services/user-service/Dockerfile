# ---------- Use pre-built JAR ----------
FROM eclipse-temurin:21-jre

# 1) Create a non-root user for security
RUN useradd -r -u 1001 spring
WORKDIR /app

# 2) Copy the pre-built JAR
COPY target/user-service-0.0.1-SNAPSHOT.jar /app/app.jar

# 3) Expose the container port your app listens on (informational)
EXPOSE 8090

# 4) Memory- & container-friendly JVM flags
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+AlwaysActAsServerClassMachine"

# 5) Drop privileges and run
USER spring
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
