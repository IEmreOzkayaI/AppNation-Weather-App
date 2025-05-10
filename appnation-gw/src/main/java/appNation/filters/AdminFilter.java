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
public class AdminFilter extends AbstractGatewayFilterFactory<AdminFilter.Config> {

  @Value("${jwt.public-key}")
  private String publicKey;

  public AdminFilter() {
    super(Config.class);
  }

  @Override
  public GatewayFilter apply(Config config) {
    return (exchange, chain) -> {
      try {
        ServerHttpRequest request = exchange.getRequest();
        String token = null;

        if (request.getCookies().containsKey("access_token")) { 
          token = request.getCookies().getFirst("access_token").getValue();
        }

        if (token != null) {
          SignedJWT jwt;
          try {
            jwt = SignedJWT.parse(token);
          } catch (ParseException e) {
            return FilterError.currentError(
                "Token validation error.",
                HttpStatus.UNAUTHORIZED,
                exchange,
                e,
                "Token validation error.");
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
            if (role == null || !role.equals("ADMIN")) {
              return FilterError.currentError(
                  "Access denied. Admin role required.",
                  HttpStatus.FORBIDDEN,
                  exchange,
                  null,
                  "Access denied due to insufficient role.");
            }
          } catch (Exception e) {
            return FilterError.currentError(
                "Token validation error.",
                HttpStatus.UNAUTHORIZED,
                exchange,
                e,
                "Token validation error.");
          }

          try {
            if (!verifyToken(token)) {
              return FilterError.currentError(
                  "Token validation error.",
                  HttpStatus.UNAUTHORIZED,
                  exchange,
                  null,
                  "Token signature validation error.");
            }
          } catch (Exception e) {
            return FilterError.currentError(
                "Token validation error.",
                HttpStatus.UNAUTHORIZED,
                exchange,
                e,
                "Token verification error.");
          }

          return chain.filter(exchange);
        } else {
          return FilterError.currentError(
              "Token validation error.",
              HttpStatus.UNAUTHORIZED,
              exchange,
              null,
              "Authorization cookie missing or malformed.");
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