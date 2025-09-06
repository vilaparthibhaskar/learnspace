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
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowCredentials = "true"
)
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public List<AssignmentDto> list(@PathVariable Long classId) {
        return assignmentService.listByClass(classId);
    }

    /**
     * Create assignment (optionally with an attachment URL).
     * Expected JSON body:
     * {
     *   "creatorEmail": "instructor@x.com",
     *   "title": "HW 1",
     *   "description": "Read ...",
     *   "dueAt": "2025-09-05T23:59:00Z",  // optional, ISO-8601
     *   "maxPoints": "100",                // optional, stringified number
     *   "attachmentUrl": "http://localhost:8080/files/abc.pdf" // optional
     * }
     */
    @PostMapping
    public ResponseEntity<AssignmentDto> create(
            @PathVariable Long classId,
            @RequestBody Map<String, String> body
    ) {
        String creatorEmail = body.get("creatorEmail");
        String title = body.get("title");
        String description = body.get("description");

        Instant dueAt = (body.get("dueAt") == null || body.get("dueAt").isBlank())
                ? null : Instant.parse(body.get("dueAt"));

        BigDecimal maxPoints = (body.get("maxPoints") == null || body.get("maxPoints").isBlank())
                ? null : new BigDecimal(body.get("maxPoints"));

        String attachmentUrl = body.get("attachmentUrl"); // may be null or blank

        // Service should persist attachmentUrl if non-null/non-blank
        AssignmentDto dto = assignmentService.create(
                classId, creatorEmail, title, description, dueAt, maxPoints, attachmentUrl
        );
        return ResponseEntity.status(201).body(dto);
    }

    /**
     * Partial update. Any field not present in the body is left unchanged.
     * To CLEAR the attachment, pass "attachmentUrl": "" (empty string).
     *
     * Expected JSON body (any subset):
     * {
     *   "editorEmail": "instructor@x.com",
     *   "title": "...",
     *   "description": "...",
     *   "dueAt": "2025-09-05T23:59:00Z",
     *   "maxPoints": "100",
     *   "attachmentUrl": "http://.../file.pdf" | ""    // "" means remove
     * }
     */
    @PatchMapping("/{assignmentId}")
    public AssignmentDto update(
            @PathVariable Long classId,
            @PathVariable Long assignmentId,
            @RequestBody Map<String, String> body
    ) {
        String editorEmail = body.get("editorEmail");
        String title = body.get("title");
        String description = body.get("description");

        Instant dueAt = (body.get("dueAt") == null || body.get("dueAt").isBlank())
                ? null : Instant.parse(body.get("dueAt"));

        BigDecimal maxPoints = (body.get("maxPoints") == null || body.get("maxPoints").isBlank())
                ? null : new BigDecimal(body.get("maxPoints"));

        boolean hasAttachmentKey = body.containsKey("attachmentUrl");
        String attachmentUrl = hasAttachmentKey ? body.get("attachmentUrl") : null; // may be "", meaning clear

        // Service should:
        // - update only fields that are present in the body
        // - if hasAttachmentKey && (attachmentUrl == null || attachmentUrl.isBlank()) => clear it
        // Suggested signature:
        // update(Long classId, Long assignmentId, String editorEmail,
        //        String title, String description, Instant dueAt, BigDecimal maxPoints,
        //        boolean attachmentProvided, String attachmentUrlOrEmptyToClear)
        return assignmentService.update(
                classId, assignmentId, editorEmail, title, description, dueAt, maxPoints,
                hasAttachmentKey, attachmentUrl
        );
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long classId,
            @PathVariable Long assignmentId,
            @RequestBody Map<String, String> body
    ) {
        String requesterEmail = body.get("requesterEmail");
        assignmentService.delete(classId, assignmentId, requesterEmail);
        return ResponseEntity.noContent().build();
    }
}
