# syntax=docker/dockerfile:1.7
FROM maven:3.9.11-eclipse-temurin-21-alpine AS build
ARG SERVICE
WORKDIR /workspace
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -pl services/${SERVICE} -am -DskipTests package \
 && cp services/${SERVICE}/target/${SERVICE}-*.jar /workspace/application.jar \
 && java -Djarmode=tools -jar /workspace/application.jar extract --layers --launcher --destination /workspace/extracted

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S spring && adduser -S -G spring -u 1001 -s /sbin/nologin spring
WORKDIR /application
COPY --from=build /workspace/extracted/dependencies/ ./
COPY --from=build /workspace/extracted/spring-boot-loader/ ./
COPY --from=build /workspace/extracted/snapshot-dependencies/ ./
COPY --from=build /workspace/extracted/application/ ./
USER spring
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC"
HEALTHCHECK --interval=15s --timeout=3s --start-period=180s --retries=6 \
    CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
