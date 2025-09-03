// src/main/java/com/example/learnspace/controller/SubmissionController.java
package com.example.learnspace.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.learnspace.dto.SubmissionDto;
import com.example.learnspace.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.Map;
import java.math.BigDecimal;


@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final Cloudinary cloudinary;

    /**
     * Local-dev style (same as classes): pass email in body.
     * Body: { "email": "student@example.com" }
     */
    @PostMapping("/my")
    public List<SubmissionDto> mySubmissions(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email is required");
        }
        return submissionService.getMySubmissionsByEmail(email);
    }

    // If you later switch to JWT, you can provide:
    // @GetMapping("/my") with @AuthenticationPrincipal or Authentication
    @GetMapping("/my")
    public List<SubmissionDto> mySubmissionsGet(@RequestParam String email) {
        return submissionService.getMySubmissionsByEmail(email);
    }
    @PostMapping("/my-in-class")
    public List<SubmissionDto> myInClass(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Long classId = body.get("classId") != null ? Long.valueOf(body.get("classId")) : null;
        return submissionService.myInClass(email, classId);
    }

    /** POST /api/submissions  { studentEmail, assignmentId, fileUrl, fileName } */
    @PostMapping
    public ResponseEntity<SubmissionDto> create(@RequestBody Map<String, String> body) {
        String studentEmail = body.get("studentEmail");
        Long assignmentId = Long.valueOf(body.get("assignmentId"));
        String fileUrl = body.get("fileUrl");
        String fileName = body.get("fileName");
        SubmissionDto created = submissionService.create(studentEmail, assignmentId, fileUrl, fileName);
        return ResponseEntity.status(201).body(created);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SubmissionDto> uploadSubmission(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studentEmail") String studentEmail,
            @RequestParam("assignmentId") Long assignmentId,
            @RequestParam("classId") Long classId
    ) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "submissions",
                            "use_filename", true,        // keep the uploaded filename
                            "unique_filename", true,     // add random suffix to avoid conflicts
                            "overwrite", false,
                            "format", FilenameUtils.getExtension(file.getOriginalFilename()) // ✅ force extension
                    )
            );

            String fileUrl = cloudinary.url()
                    .resourceType("raw")
                    .signed(true)
                    .generate("submissions/" + file.getOriginalFilename());
            System.out.println(fileUrl);
            String fileName = file.getOriginalFilename();             // just for display

            SubmissionDto created = submissionService.create(studentEmail, assignmentId, fileUrl, fileName);

            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }



    /** PATCH /api/submissions/{id}/grade  { graderEmail, points, feedback } */
    @PatchMapping("/{id}/grade")
    public SubmissionDto grade(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String graderEmail = body.get("graderEmail");
        BigDecimal points = body.get("points") == null ? null : new BigDecimal(body.get("points"));
        String feedback = body.get("feedback");
        return submissionService.grade(graderEmail, id, points, feedback);
    }
}
