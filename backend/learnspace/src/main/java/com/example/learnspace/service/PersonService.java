// src/main/java/com/example/learnspace/service/PersonService.java
package com.example.learnspace.service;

import com.example.learnspace.dto.ChangePasswordRequest;
import com.example.learnspace.dto.PersonDto;
import com.example.learnspace.dto.UpdateProfileRequest;
import com.example.learnspace.model.entity.Person;
import com.example.learnspace.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PersonDto getByEmail(String email) {
        Person p = personRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + email));
        return PersonDto.from(p);
    }

    @Transactional
    public PersonDto updateProfile(UpdateProfileRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }

        Person p = personRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + req.getEmail()));

        // Update allowed fields
        if (req.getName() != null)   p.setName(req.getName());
        if (req.getPhone() != null)  p.setPhone(req.getPhone());
        if (req.getAddress() != null) p.setAddress(req.getAddress());

        // Role: since your UI lets user edit role, we keep it simple for local dev
        if (req.getRole() != null && !req.getRole().isBlank()) {
            p.setRole(req.getRole());
        }

        Person saved = personRepository.save(p);
        return PersonDto.from(saved);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()
                || req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()
                || req.getNewPassword() == null || req.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email, currentPassword, newPassword are required");
        }

        Person p = personRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + req.getEmail()));

        if (!passwordEncoder.matches(req.getCurrentPassword(), p.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        p.setPassword(passwordEncoder.encode(req.getNewPassword()));
        personRepository.save(p);
    }
}
