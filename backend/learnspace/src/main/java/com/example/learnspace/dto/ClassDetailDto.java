package com.example.learnspace.dto;

import com.example.learnspace.model.entity.ClassRoom;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClassDetailDto {
    private Long id;
    private String title;
    private String code;
    private String description;
    private String status;
    private String createdByEmail;
    private String myRole; // optional (INSTRUCTOR / STUDENT) if caller is a member

    public static ClassDetailDto from(ClassRoom c, String createdByEmail, String myRole) {
        return new ClassDetailDto(
                c.getId(),
                c.getTitle(),
                c.getCode(),
                c.getDescription(),
                c.getStatus() == null ? "ACTIVE" : c.getStatus().name(), // if enum, adjust
                createdByEmail,
                myRole
        );
    }
}
