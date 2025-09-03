package com.example.learnspace.model.entity;

import com.example.learnspace.model.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "submissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id","student_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Person student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    @Column(nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();

    @Lob
    private String textAnswer;

    private BigDecimal gradePoints;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private Person gradedBy;

    private Instant gradedAt;

    @Lob
    private String feedback;

    @Column(length = 255)
    private String fileUrl;

    @Column(length = 255)
    private String fileName;
}
