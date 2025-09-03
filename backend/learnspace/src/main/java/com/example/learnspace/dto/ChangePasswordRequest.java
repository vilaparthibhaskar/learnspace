// src/main/java/com/example/learnspace/dto/ChangePasswordRequest.java
package com.example.learnspace.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String email;           // required (identity)
    private String currentPassword; // required
    private String newPassword;     // required
}
