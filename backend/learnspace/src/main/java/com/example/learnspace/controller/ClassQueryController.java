package com.example.learnspace.controller;

// src/main/java/com/learnspace/web/ClassQueryController.java

import com.example.learnspace.dto.ClassRoomDto;
import com.example.learnspace.service.ClassQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class ClassQueryController {

    private final ClassQueryService classQueryService;

    @PostMapping("/my")
    public List<ClassRoomDto> myClasses(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        System.out.println(email);
        return classQueryService.getMyClassesByEmail(email);
    }

    @PostMapping
    public ResponseEntity<ClassRoomDto> createClass(@RequestBody Map<String, String> body) {
        System.out.println("Request came");
        String ownerEmail  = body.get("ownerEmail");
        String name        = body.get("name");
        String description = body.getOrDefault("description", null);
        String code = body.get("code");

        if (ownerEmail == null || ownerEmail.isBlank() || name == null || name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        System.out.println("this is working1");

        ClassRoomDto created = classQueryService.createClassForOwner(ownerEmail, name, description, code);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String ownerEmail = body.get("ownerEmail");
        if (ownerEmail == null || ownerEmail.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        classQueryService.deleteClassOwnedBy(ownerEmail, id);
        return ResponseEntity.noContent().build();
    }


}

