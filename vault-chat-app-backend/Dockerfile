# ---------- Stage 1: Build ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy only pom.xml first (better caching)
COPY pom.xml .
RUN mvn -B -q -e -DskipTests dependency:go-offline

# Copy source code
COPY src ./src

# Build JAR
RUN mvn -B -q clean package -DskipTests


# ---------- Stage 2: Run ----------
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy built jar
COPY --from=builder /app/target/*.jar app.jar

# Render provides PORT dynamically
EXPOSE 8080

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]