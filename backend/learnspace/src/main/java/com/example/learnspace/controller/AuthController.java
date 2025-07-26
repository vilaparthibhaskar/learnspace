package com.example.learnspace.controller;

import com.example.learnspace.model.Person;
import com.example.learnspace.repository.PersonRepository;
import com.example.learnspace.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private PersonRepository personRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Person person) {
        if (personRepository.findByEmail(person.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        person.setPassword(passwordEncoder.encode(person.getPassword()));
        personRepository.save(person);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Person person) {
        Person dbPerson = personRepository.findByEmail(person.getEmail())
                .orElse(null);

        System.out.println(person.toString());

        if (dbPerson == null || !passwordEncoder.matches(person.getPassword(), dbPerson.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(dbPerson.getEmail()); // or dbPerson.getName() if needed
        return ResponseEntity.ok(Map.of("token", token, "userName", dbPerson.getName(), "email", dbPerson.getEmail(), "address", dbPerson.getAddress(), "PhoneNumber", dbPerson.getPhone() , "role", dbPerson.getRole()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Optionally: blacklist the token or invalidate it in your cache
            System.out.println("Logging out token: " + token);
        }
        return ResponseEntity.ok("Logged out successfully");
    }

}