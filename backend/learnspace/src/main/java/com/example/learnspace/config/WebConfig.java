// src/main/java/com/example/learnspace/config/WebConfig.java
package com.example.learnspace.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")                       // scope to your API
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")                 // optional, if you read it on client
                .allowCredentials(true)                          // <-- REQUIRED for credentials
                .maxAge(3600);                                   // cache preflight 1 hour
    }
}
