// src/main/java/com/example/learnspace/controller/FileUploadController.java
package com.example.learnspace.controller;

import com.example.learnspace.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;          // <-- add
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/uploads")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class FileUploadController {

    private final FileStorageService fileStorage;

    @PostMapping(value = "/local", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadLocal(@RequestPart("file") MultipartFile file) throws IOException { // <-- declare
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }

        var stored = fileStorage.store(file);  // may throw IOException

        return ResponseEntity.ok(Map.of(
                "url", stored.publicUrl(),
                "name", stored.originalName(),
                "size", file.getSize(),
                "contentType", file.getContentType()
        ));
    }
}
