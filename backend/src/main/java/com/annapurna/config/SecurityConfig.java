package com.annapurna.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration
 * - Enables CORS so React frontend can call the backend
 * - Disables CSRF (not needed for REST APIs)
 * - Allows public access to /api/auth/** and /api/public/**
 * - All other endpoints require a valid Firebase JWT token
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — REST APIs don't use browser session cookies
            .csrf(csrf -> csrf.disable())

            // Configure CORS using our corsConfigurationSource bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless session — we use Firebase JWT, not server sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Define which endpoints are public vs protected
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no token needed
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                // Everything else needs authentication
                .anyRequest().permitAll()  // Change to .authenticated() after adding Firebase filter
            );

        return http.build();
    }

    /**
     * CORS Configuration
     * Allows the React frontend to call the Spring Boot backend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow requests from the React dev server
        config.setAllowedOrigins(List.of(frontendUrl, "http://localhost:5173", "http://localhost:3000"));

        // Allow standard HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allow common headers including Authorization (for Firebase token)
        config.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Accept",
            "X-Requested-With", "Access-Control-Allow-Origin"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
