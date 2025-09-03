// com.example.learnspace.controller.UploadController
package com.example.learnspace.controller;

import com.example.learnspace.dto.SubmissionDto;
import com.example.learnspace.service.FileStorageService;
import com.example.learnspace.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class UploadController {

    private final FileStorageService fileStorage;
    private final SubmissionService submissionService;

    /**
     * Multipart endpoint that:
     * 1) Uploads file to Cloudinary
     * 2) Creates a Submission row with fileUrl/fileName
     *
     * form-data:
     *  - file: (binary)
     *  - studentEmail: string
     *  - assignmentId: number
     *  - classId: number (for foldering; service also validates membership)
     */
    @PostMapping("/submission")
    public ResponseEntity<SubmissionDto> uploadSubmission(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentEmail") String studentEmail,
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("classId") Long classId
    ) throws Exception {

        var uploaded = fileStorage.uploadSubmissionFile(file, classId, assignmentId, studentEmail);
        var dto = submissionService.create(studentEmail, assignmentId, uploaded.url(), uploaded.fileName());
        return ResponseEntity.status(201).body(dto);
    }
}
