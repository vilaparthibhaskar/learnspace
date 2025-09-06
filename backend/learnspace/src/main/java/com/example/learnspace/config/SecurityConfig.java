// src/main/java/com/example/learnspace/config/SecurityConfig.java
package com.example.learnspace.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // everything is open in dev; lock down later as needed
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    /**
     * CORS used by Spring Security (covers preflight). We scope it to API + files.
     * If you later serve from a different host/port, add it to allowedOrigins.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        // If you want to read filename from JS on downloads, you can expose:
        // cfg.setExposedHeaders(List.of("Authorization","Content-Disposition"));
        cfg.setExposedHeaders(List.of("Authorization"));
        cfg.setAllowCredentials(true);   // needed when fetch(..., { credentials: "include" })
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Your JSON APIs (includes uploads endpoint under /api/uploads/local)
        source.registerCorsConfiguration("/api/**", cfg);
        // Static files served by WebMvcConfigurer.addResourceHandlers("/files/**")
        source.registerCorsConfiguration("/files/**", cfg);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
