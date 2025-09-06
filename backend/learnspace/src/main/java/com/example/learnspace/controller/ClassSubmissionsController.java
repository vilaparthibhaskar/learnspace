// src/main/java/com/example/learnspace/controller/ClassSubmissionsController.java
package com.example.learnspace.controller;

import com.example.learnspace.dto.SubmissionDto;
import com.example.learnspace.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
@RequestMapping("/api/classes/{classId}/submissions")
public class ClassSubmissionsController {

    private final SubmissionService submissionService;

    @GetMapping
    public List<SubmissionDto> list(@PathVariable Long classId) {
        return submissionService.listByClass(classId);
    }
}
