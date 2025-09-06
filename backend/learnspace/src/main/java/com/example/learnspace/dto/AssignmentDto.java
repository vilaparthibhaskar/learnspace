// src/main/java/com/example/learnspace/dto/AssignmentDto.java
package com.example.learnspace.dto;

import com.example.learnspace.model.entity.Assignment;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
public class AssignmentDto {
    private Long id;
    private String title;
    private String description;
    private Instant dueAt;
    private BigDecimal maxPoints;
    private String attachmentUrl; // NEW

    public static AssignmentDto from(Assignment a) {
        return new AssignmentDto(
                a.getId(),
                a.getTitle(),
                a.getDescription(),
                a.getDueAt(),
                a.getMaxPoints(),
                a.getAttachmentUrl() // NEW
        );
    }
}
