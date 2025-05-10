package appNation.utils;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Component()
public class FilterError extends Exception {

    public static Mono<Void> currentError(
            String err,
            HttpStatus httpStatus,
            ServerWebExchange exchange,
            Exception exception,
            String customErrorMessage) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> responseBody = new LinkedHashMap<>();
        responseBody.put("statusCode", httpStatus.value());
        responseBody.put("success", false);
        responseBody.put("timestamp", java.time.Instant.now().toString());
        responseBody.put("path", exchange.getRequest().getPath().toString());
        responseBody.put("data", null);
        responseBody.put("error", Map.of(
                "message", err,
                "type", httpStatus.getReasonPhrase()));

        ObjectMapper objectMapper = new ObjectMapper();
        byte[] errorBytes;
        try {
            errorBytes = objectMapper.writeValueAsBytes(responseBody);
        } catch (Exception e) {
            errorBytes = "{}".getBytes(StandardCharsets.UTF_8);
        }

        DataBufferFactory bufferFactory = response.bufferFactory();
        DataBuffer dataBuffer = bufferFactory.wrap(errorBytes);

        String errorMessage = customErrorMessage + " " + (exception != null ? "-" + exception : "");
        System.out.println("Error: " + errorMessage);

        return response.writeWith(Mono.just(dataBuffer)).then(Mono.empty());
    }

    public static Map<String, Object> createServiceUnavailableErrorMessage() {
        HttpStatus status = HttpStatus.SERVICE_UNAVAILABLE;
        String description = "API is taking too long to respond or is down. Please try again later.";

        // Create the response body in the desired format
        Map<String, Object> responseBody = new LinkedHashMap<>();
        responseBody.put("statusCode", status.value());
        responseBody.put("success", false);
        responseBody.put("timestamp", java.time.Instant.now().toString());
        responseBody.put("path", null);
        responseBody.put("data", null);
        responseBody.put("error", Map.of(
                "message", description,
                "type", status.getReasonPhrase()));

        return responseBody;
    }
}
