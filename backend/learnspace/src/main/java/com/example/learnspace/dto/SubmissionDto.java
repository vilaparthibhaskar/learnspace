// src/main/java/com/example/learnspace/dto/SubmissionDto.java
package com.example.learnspace.dto;

import com.example.learnspace.model.entity.Submission;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
public class SubmissionDto {
    private Long id;
    private String classTitle;       // ClassRoom.title
    private String classCode;        // ClassRoom.code
    private String assignmentTitle;
    private String status;
    private BigDecimal gradePoints;
    private Instant submittedAt;
    private String fileUrl;          // ✅ correct field
    private String fileName;         // ✅ correct field
    private String studentEmail;     // ✅ NEW: submitted-by email

    public static SubmissionDto from(Submission s) {
        var assignment = s.getAssignment();
        String aTitle = assignment != null ? assignment.getTitle() : null;

        String cTitle = null;
        String cCode  = null;
        if (assignment != null && assignment.getClazz() != null) {
            cTitle = assignment.getClazz().getTitle(); // ClassRoom.title
            cCode  = assignment.getClazz().getCode();  // ClassRoom.code
        }

        String email = (s.getStudent() != null) ? s.getStudent().getEmail() : null;

        return new SubmissionDto(
                s.getId(),
                cTitle,
                cCode,
                aTitle,
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getGradePoints(),
                s.getSubmittedAt(),
                s.getFileUrl(),   // ✅ was swapped before
                s.getFileName(),  // ✅ was swapped before
                email             // ✅ submitted-by email
        );
    }
}
