// src/main/java/com/example/learnspace/controller/PersonController.java
package com.example.learnspace.controller;

import com.example.learnspace.dto.ChangePasswordRequest;
import com.example.learnspace.dto.PersonDto;
import com.example.learnspace.dto.UpdateProfileRequest;
import com.example.learnspace.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/person")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"}, allowCredentials = "true")
public class PersonController {

    private final PersonService personService;

    // Local-dev convenience: fetch by email in the body
    @PostMapping("/by-email")
    public PersonDto getByEmail(@RequestBody UpdateProfileRequest req) {
        return personService.getByEmail(req.getEmail());
    }

    // Frontend ProfilePage uses PUT /api/person/profile
    @PutMapping("/profile")
    public PersonDto updateProfile(@RequestBody UpdateProfileRequest req) {
        return personService.updateProfile(req);
    }

    // Frontend optional Change Password card uses PUT /api/person/password
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest req) {
        personService.changePassword(req);
        return ResponseEntity.noContent().build();
    }
}
