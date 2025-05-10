package appNation.configs;
 
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode;
 
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
 
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        configureAuthorization(http);
        disableCsrf(http);
        configureHeaders(http);
        return http.build();
    }
 
    private void configureAuthorization(ServerHttpSecurity http) {
        http.authorizeExchange(exchanges -> exchanges
                .anyExchange().permitAll());
    }
 
    private void disableCsrf(ServerHttpSecurity http) {
        http.csrf(ServerHttpSecurity.CsrfSpec::disable);
    }
 
    private void configureHeaders(ServerHttpSecurity http) {
        http.headers(headers -> headers.frameOptions(
                frameOptionsSpec -> frameOptionsSpec.mode(Mode.SAMEORIGIN)));
    }
}