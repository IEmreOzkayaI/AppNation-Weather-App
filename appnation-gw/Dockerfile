# ---- Build Stage ----
FROM maven:3.8.7-openjdk-18-slim AS build

WORKDIR /usr/build

# Copy the pom.xml and download dependencies
COPY pom.xml .

RUN mvn dependency:go-offline -B

# Copy the source and build the application
COPY src /usr/build/src

RUN mvn clean package

# ---- Run Stage ----
FROM gcr.io/distroless/java21

ENV PORT=8080

WORKDIR /usr/app

COPY --from=build /usr/build/target/appNation-gateway-*.jar /usr/app/appNation-gateway.jar

ENV JAVA_OPTS=" -Dserver=-appNation-gateway -Dlog4j2.formatMsgNoLookups=true -Djava.security.egd=file:/dev/./urandom -Dserver.port=8080 -Xmx256m -Xmx256m -Dfile.encoding=UTF-8"

CMD ["/usr/app/appNation-gateway.jar"]

EXPOSE 8080

HEALTHCHECK --interval=5s --timeout=5s CMD curl http://127.0.0.1:8080/version || exit 1
