// src/main/java/com/example/learnspace/service/FileStorageService.java
package com.example.learnspace.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.base-url}")
    private String baseUrl;

    private Path root;

    @PostConstruct
    void init() throws IOException {
        root = Paths.get(uploadDir);
        Files.createDirectories(root);
    }

    public record StoredFile(String publicUrl, String storedName, String originalName, String contentType) {}

    public StoredFile store(MultipartFile file) throws IOException {
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String safeBase = original.replaceAll("[^a-zA-Z0-9._-]+", "-");
        String storedName = UUID.randomUUID() + "-" + safeBase;

        Path target = root.resolve(storedName).normalize();
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Build public URL handled by FileServeController below
        String publicUrl = baseUrl + "/files/" + storedName;
        return new StoredFile(publicUrl, storedName, original, file.getContentType());
    }

    public FileSystemResource loadAsResource(String storedName) {
        Path p = root.resolve(storedName).normalize();
        return new FileSystemResource(p.toFile());
    }
}
