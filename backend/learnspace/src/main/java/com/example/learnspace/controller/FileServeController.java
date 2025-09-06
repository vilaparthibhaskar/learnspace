// src/main/java/com/example/learnspace/controller/FileServeController.java
package com.example.learnspace.controller;

import com.example.learnspace.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;

@RestController
@RequiredArgsConstructor
public class FileServeController {

    private final FileStorageService storage;

    /** GET /files/{name} → serves files inline (PDFs open in browser) */
    @GetMapping("/files/{name}")
    public ResponseEntity<Resource> serve(@PathVariable("name") String name) throws Exception {
        var res = storage.loadAsResource(name);
        if (!res.exists()) return ResponseEntity.notFound().build();

        String contentType = Files.probeContentType(res.getFile().toPath());
        if (contentType == null) contentType = "application/octet-stream";

        ContentDisposition cd = ContentDisposition.inline().filename(res.getFilename()).build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, cd.toString())
                .cacheControl(CacheControl.noCache())
                .body(res);
    }
}
