package appNation.filters;

import static com.nimbusds.jose.JWSAlgorithm.RS256;

import com.nimbusds.jwt.SignedJWT;

import appNation.utils.FilterError;

import java.text.ParseException;
import org.jose4j.jws.JsonWebSignature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
public class UserFilter extends AbstractGatewayFilterFactory<UserFilter.Config> {

  @Value("${jwt.public-key}")
  private String publicKey;

  public UserFilter() {
    super(Config.class);
  }

  @Override
  public GatewayFilter apply(Config config) {
    return (exchange, chain) -> {
      try {
        ServerHttpRequest request = exchange.getRequest();
        String authorizationHeader = request.getHeaders().getFirst("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
          return FilterError.currentError(
              "Authorization header is missing or malformed.",
              HttpStatus.UNAUTHORIZED,
              exchange,
              null,
              "Authorization header is missing or malformed.");
        }

        String token = authorizationHeader.substring(7); // Remove "Bearer " prefix

        SignedJWT jwt;
        try {
          jwt = SignedJWT.parse(token);
        } catch (ParseException e) {
          return FilterError.currentError(
              "Token validation error.",
              HttpStatus.UNAUTHORIZED,
              exchange,
              e,
              "Token parsing error.");
        }

        try {
          if (!jwt.getHeader().getAlgorithm().equals(RS256)) {
            return FilterError.currentError(
                "Token validation error.",
                HttpStatus.UNAUTHORIZED,
                exchange,
                null,
                "Token algorithm validation error.");
          }

          if (jwt.getJWTClaimsSet().getExpirationTime().getTime() < System.currentTimeMillis()) {
            return FilterError.currentError(
                "Token validation error.",
                HttpStatus.UNAUTHORIZED,
                exchange,
                null,
                "Token expiration error.");
          }

          String role = (String) jwt.getJWTClaimsSet().getClaim("role");
          if (role == null || !role.equals("USER")) {
            return FilterError.currentError(
                "Access denied. User role required.",
                HttpStatus.FORBIDDEN,
                exchange,
                null,
                "Access denied due to insufficient role.");
          }

          String userId = jwt.getJWTClaimsSet().getSubject(); // Extract "sub" field
          if (userId == null) {
            return FilterError.currentError(
                "Token validation error.",
                HttpStatus.UNAUTHORIZED,
                exchange,
                null,
                "Token does not contain a subject (sub).");
          }

          // Add x-user-id header
          ServerHttpRequest modifiedRequest = request.mutate()
              .header("x-user-id", userId)
              .build();

          return chain.filter(exchange.mutate().request(modifiedRequest).build());
        } catch (Exception e) {
          return FilterError.currentError(
              "Token validation error.",
              HttpStatus.UNAUTHORIZED,
              exchange,
              e,
              "Token validation error.");
        }

      } catch (Exception e) {
        return FilterError.currentError(
            "Unexpected Gateway Error",
            HttpStatus.UNAUTHORIZED,
            exchange,
            e,
            "Unexpected Gateway Error");
      }
    };
  }

  public boolean verifyToken(String token) throws Exception {
    String cleanedPublicKey = publicKey.replace("{", "").replace("}", "");

    java.security.KeyFactory keyFactory = java.security.KeyFactory.getInstance("RSA");

    String keyContent = cleanedPublicKey
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .trim();

    byte[] keyBytes = java.util.Base64.getDecoder().decode(keyContent);

    java.security.spec.X509EncodedKeySpec keySpec = new java.security.spec.X509EncodedKeySpec(keyBytes);
    java.security.PublicKey rsaPublicKey = keyFactory.generatePublic(keySpec);

    JsonWebSignature jws = new JsonWebSignature();
    jws.setCompactSerialization(token);
    jws.setKey(rsaPublicKey);

    return jws.verifySignature();
  }

  public static class Config {
    // Properties go here if needed
  }
}