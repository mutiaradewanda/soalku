# Stage 1: Build the multi-module Maven project
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copy Maven parent & submodule POMs
COPY pom.xml ./
COPY core/pom.xml ./core/
COPY extraction/pom.xml ./extraction/
COPY persistence/pom.xml ./persistence/
COPY web-api/pom.xml ./web-api/

# Copy source trees
COPY core/src ./core/src
COPY extraction/src ./extraction/src
COPY persistence/src ./persistence/src
COPY web-api/src ./web-api/src

# Package artifact
RUN mvn clean package -DskipTests

# Stage 2: Optimized JRE 21 Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user
RUN addgroup -S soalku && adduser -S soalku -G soalku
USER soalku:soalku

# Copy executable jar
COPY --from=builder /build/web-api/target/web-api-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
