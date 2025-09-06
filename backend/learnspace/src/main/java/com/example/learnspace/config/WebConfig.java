// src/main/java/com/example/learnspace/config/WebConfig.java
package com.example.learnspace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Folder on disk where FileStorageService saves files (configurable)
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // API CORS
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);

        // Static files CORS (optional but handy if you fetch/embed PDFs from React)
        registry.addMapping("/files/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /files/** to the local upload folder
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        String location = root.toUri().toString(); // e.g. "file:/C:/.../uploads/"
        if (!location.endsWith("/")) location += "/";

        registry.addResourceHandler("/files/**")
                .addResourceLocations(location)
                .setCachePeriod(0); // disable caching during dev; raise in prod
        // .resourceChain(true) // enable in prod with versioning, etc.
    }
}
