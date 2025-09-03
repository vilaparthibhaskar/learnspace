// src/main/java/com/example/learnspace/controller/AssignmentController.java
package com.example.learnspace.controller;

import com.example.learnspace.dto.AssignmentDto;
import com.example.learnspace.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes/{classId}/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public List<AssignmentDto> list(@PathVariable Long classId) {
        return assignmentService.listByClass(classId);
    }

    @PostMapping
    public ResponseEntity<AssignmentDto> create(@PathVariable Long classId, @RequestBody Map<String, String> body) {
        String creatorEmail = body.get("creatorEmail");
        String title = body.get("title");
        String description = body.get("description");
        Instant dueAt = body.get("dueAt") == null || body.get("dueAt").isBlank()
                ? null : Instant.parse(body.get("dueAt"));
        BigDecimal maxPoints = body.get("maxPoints") == null || body.get("maxPoints").isBlank()
                ? null : new BigDecimal(body.get("maxPoints"));

        AssignmentDto dto = assignmentService.create(classId, creatorEmail, title, description, dueAt, maxPoints);
        return ResponseEntity.status(201).body(dto);
    }

    @PatchMapping("/{assignmentId}")
    public AssignmentDto update(@PathVariable Long classId, @PathVariable Long assignmentId,
                                @RequestBody Map<String, String> body) {
        String editorEmail = body.get("editorEmail");
        String title = body.get("title");
        String description = body.get("description");
        Instant dueAt = body.get("dueAt") == null || body.get("dueAt").isBlank()
                ? null : Instant.parse(body.get("dueAt"));
        BigDecimal maxPoints = body.get("maxPoints") == null || body.get("maxPoints").isBlank()
                ? null : new BigDecimal(body.get("maxPoints"));

        return assignmentService.update(classId, assignmentId, editorEmail, title, description, dueAt, maxPoints);
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> delete(@PathVariable Long classId, @PathVariable Long assignmentId,
                                       @RequestBody Map<String, String> body) {
        String requesterEmail = body.get("requesterEmail");
        assignmentService.delete(classId, assignmentId, requesterEmail);
        return ResponseEntity.noContent().build();
    }
}
