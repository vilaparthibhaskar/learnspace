// src/main/java/com/example/learnspace/dto/AlertDto.java
package com.example.learnspace.dto;

import com.example.learnspace.model.entity.Alert;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class AlertDto {
    private Long id;
    private String title;
    private String body;
    private String classTitle;
    private String classCode;
    private String createdByName;
    private boolean pinned;
    private Instant createdAt;
    private Instant updatedAt;

    public static AlertDto from(Alert a) {
        String classTitle = (a.getClazz() != null) ? a.getClazz().getTitle() : null;
        String classCode  = (a.getClazz() != null) ? a.getClazz().getCode()  : null;
        String createdBy  = (a.getCreatedBy() != null) ? a.getCreatedBy().getName() : null;

        return new AlertDto(
                a.getId(),
                a.getTitle(),
                a.getBody(),
                classTitle,
                classCode,
                createdBy,
                a.isPinned(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
