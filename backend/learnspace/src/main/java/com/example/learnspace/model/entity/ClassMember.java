package com.example.learnspace.model.entity;

import com.example.learnspace.model.enums.ClassRole;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "class_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"class_id","person_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom clazz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassRole roleInClass; // INSTRUCTOR or STUDENT

    @Column(nullable = false, updatable = false)
    private Instant joinedAt = Instant.now();
}
