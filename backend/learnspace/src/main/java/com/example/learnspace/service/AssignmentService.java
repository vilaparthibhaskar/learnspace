// src/main/java/com/example/learnspace/service/AssignmentService.java
package com.example.learnspace.service;

import com.example.learnspace.dto.AssignmentDto;
import com.example.learnspace.model.entity.Assignment;
import com.example.learnspace.model.entity.ClassRoom;
import com.example.learnspace.model.entity.Person;
import com.example.learnspace.model.enums.ClassRole;
import com.example.learnspace.repository.AssignmentRepository;
import com.example.learnspace.repository.ClassMemberRepository;
import com.example.learnspace.repository.ClassRoomRepository;
import com.example.learnspace.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepo;
    private final ClassRoomRepository classRoomRepo;
    private final PersonRepository personRepo;
    private final ClassMemberRepository classMemberRepo;

    @Transactional(readOnly = true)
    public List<AssignmentDto> listByClass(Long classId) {
        return assignmentRepo.findByClazz_IdOrderByDueAtAsc(classId)
                .stream().map(AssignmentDto::from).toList();
    }

    /**
     * Create assignment (optionally with attachmentUrl).
     */
    @Transactional
    public AssignmentDto create(Long classId, String creatorEmail, String title, String description,
                                Instant dueAt, BigDecimal maxPoints, String attachmentUrl) {
        // must be instructor/admin in this class
        boolean canCreate = classMemberRepo.existsByPerson_EmailAndClazz_IdAndRoleInClass(
                creatorEmail, classId, ClassRole.INSTRUCTOR);
        if (!canCreate) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can create assignments");
        }

        ClassRoom clazz = classRoomRepo.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));
        Person creator = personRepo.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator not found"));

        Assignment a = Assignment.builder()
                .clazz(clazz)
                .title(title)
                .description(description)
                .dueAt(dueAt)
                .maxPoints(maxPoints == null ? new BigDecimal("100.00") : maxPoints)
                .attachmentUrl((attachmentUrl == null || attachmentUrl.isBlank()) ? null : attachmentUrl)
                .createdBy(creator)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return AssignmentDto.from(assignmentRepo.save(a));
    }

    /**
     * Partial update.
     * - Fields set to null/blank by caller will be applied as such (e.g., dueAt null clears due date).
     * - For attachment: only changed when attachmentProvided = true.
     *     - attachmentProvided && attachmentUrl is blank => clear attachment
     *     - attachmentProvided && attachmentUrl non-blank => set/replace
     *     - attachmentProvided == false => leave as-is
     */
    @Transactional
    public AssignmentDto update(Long classId, Long assignmentId, String editorEmail, String title,
                                String description, Instant dueAt, BigDecimal maxPoints,
                                boolean attachmentProvided, String attachmentUrl) {
        boolean canEdit = classMemberRepo.existsByPerson_EmailAndClazz_IdAndRoleInClass(
                editorEmail, classId, ClassRole.INSTRUCTOR);
        if (!canEdit) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can update assignments");
        }

        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!a.getClazz().getId().equals(classId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignment not in this class");
        }

        if (title != null) a.setTitle(title);
        if (description != null) a.setDescription(description);

        // Keep your existing semantics: controller always sends dueAt (ISO or blank),
        // so setting here will either update or clear.
        a.setDueAt(dueAt);

        if (maxPoints != null) a.setMaxPoints(maxPoints);

        if (attachmentProvided) {
            if (attachmentUrl == null || attachmentUrl.isBlank()) {
                a.setAttachmentUrl(null); // clear
            } else {
                a.setAttachmentUrl(attachmentUrl); // set/replace
            }
        }

        a.setUpdatedAt(Instant.now());
        return AssignmentDto.from(assignmentRepo.save(a));
    }

    @Transactional
    public void delete(Long classId, Long assignmentId, String requesterEmail) {
        boolean canDelete = classMemberRepo.existsByPerson_EmailAndClazz_IdAndRoleInClass(
                requesterEmail, classId, ClassRole.INSTRUCTOR);
        if (!canDelete) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can delete assignments");
        }

        Assignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!a.getClazz().getId().equals(classId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignment not in this class");
        }
        assignmentRepo.delete(a);
    }
}
