// src/main/java/com/example/learnspace/dto/UpdateProfileRequest.java
package com.example.learnspace.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String email;   // immutable identity (required)
    private String name;
    private String phone;
    private String address;
    private String role;    // you allow editing role in UI; keep or remove as you like
}
