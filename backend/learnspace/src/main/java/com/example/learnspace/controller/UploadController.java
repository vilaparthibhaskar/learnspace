// src/main/java/com/example/learnspace/controller/UploadController.java
package com.example.learnspace.controller;

import com.example.learnspace.dto.SubmissionDto;
import com.example.learnspace.service.FileStorageService;
import com.example.learnspace.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submissions")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class UploadController {

    private final FileStorageService fileStorage;     // has store(MultipartFile)
    private final SubmissionService submissionService;

    /**
     * Upload file to local storage and create a Submission.
     * Accepts multipart FormData:
     *   - file
     *   - studentEmail
     *   - assignmentId
     *   - classId (not used in creation, but accepted)
     */
    @PostMapping(value = {"/upload-local", "/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionDto> uploadLocal(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentEmail") String studentEmail,
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("classId") Long classId
    ) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (studentEmail == null || studentEmail.isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            if (assignmentId == null) {
                return ResponseEntity.badRequest().build();
            }

            // ✅ THIS is the correct call: use the existing store(...)
            var stored = fileStorage.store(file);

            // Save Submission with public URL + original filename
            SubmissionDto created = submissionService.create(
                    studentEmail,
                    assignmentId,
                    stored.publicUrl(),     // e.g. http://localhost:8080/files/<storedName>
                    stored.originalName()   // for display in UI
            );

            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
