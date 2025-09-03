// src/main/java/com/example/learnspace/controller/AlertController.java
package com.example.learnspace.controller;

import com.example.learnspace.dto.AlertDto;
import com.example.learnspace.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class AlertController {

    private final AlertService alertService;

    /** Local-dev style: body { "email": "user@example.com" } */
    @PostMapping("/my")
    public List<AlertDto> myAlerts(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        return alertService.getMyAlertsByEmail(email);
    }

    /** Get alerts for a specific class (public to members) */
    @GetMapping("/class/{classId}")
    public List<AlertDto> classAlerts(@PathVariable Long classId) {
        return alertService.getClassAlerts(classId);
    }

    /** Create alert (instructor only) — body: { creatorEmail, classId, title, body } */
    @PostMapping
    public ResponseEntity<AlertDto> create(@RequestBody Map<String, String> body) {
        String creatorEmail = body.get("creatorEmail");
        Long classId = body.get("classId") != null ? Long.valueOf(body.get("classId")) : null;
        String title = body.get("title");
        String content = body.get("body");
        AlertDto created = alertService.createAlert(creatorEmail, classId, title, content);
        return ResponseEntity.status(201).body(created);
    }

    /** Delete alert — body: { requesterEmail } */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String requesterEmail = body.get("requesterEmail");
        alertService.deleteAlert(requesterEmail, id);
        return ResponseEntity.noContent().build();
    }

    /** Pin/unpin — body: { requesterEmail, pinned: true|false } */
    @PatchMapping("/{id}/pin")
    public AlertDto setPinned(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String requesterEmail = (String) body.get("requesterEmail");
        boolean pinned = body.get("pinned") != null && Boolean.parseBoolean(body.get("pinned").toString());
        return alertService.setPinned(requesterEmail, id, pinned);
    }
}

