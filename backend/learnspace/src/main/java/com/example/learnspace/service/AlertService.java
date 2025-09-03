// src/main/java/com/example/learnspace/service/AlertService.java
package com.example.learnspace.service;

import com.example.learnspace.dto.AlertDto;
import com.example.learnspace.model.entity.Alert;
import com.example.learnspace.model.entity.ClassMember;
import com.example.learnspace.model.entity.ClassRoom;
import com.example.learnspace.model.entity.Person;
import com.example.learnspace.model.enums.ClassRole;
import com.example.learnspace.repository.AlertRepository;
import com.example.learnspace.repository.ClassMemberRepository;
import com.example.learnspace.repository.ClassRoomRepository;
import com.example.learnspace.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepo;
    private final PersonRepository personRepo;
    private final ClassRoomRepository classRoomRepo;
    private final ClassMemberRepository classMemberRepo;

    @Transactional(readOnly = true)
    public List<AlertDto> getMyAlertsByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
        // ensure user exists (clear 404 instead of 500)
        personRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + email));

        return alertRepo.findAllVisibleToUser(email).stream()
                .map(AlertDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getClassAlerts(Long classId) {
        return alertRepo.findByClazz_IdOrderByPinnedDescCreatedAtDesc(classId)
                .stream().map(AlertDto::from).toList();
    }

    @Transactional
    public AlertDto createAlert(String creatorEmail, Long classId, String title, String body) {
        if (creatorEmail == null || creatorEmail.isBlank() ||
                title == null || title.isBlank() ||
                body == null || body.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "creatorEmail, title, body are required");
        }

        Person creator = personRepo.findByEmail(creatorEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator not found: " + creatorEmail));

        ClassRoom clazz = classRoomRepo.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found: " + classId));

        // Must be a member and instructor to post alerts (adjust if you want students to post)
        var membership = classMemberRepo.findByPerson_EmailAndClazz_Id(creatorEmail, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member of this class"));

        if (membership.getRoleInClass() != ClassRole.INSTRUCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can post alerts");
        }

        Alert alert = Alert.builder()
                .clazz(clazz)
                .title(title)
                .body(body)
                .createdBy(creator)
                .pinned(false)
                .build();

        alert = alertRepo.save(alert);

        return AlertDto.from(alert);
    }

    @Transactional
    public void deleteAlert(String requesterEmail, Long alertId) {
        Alert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        Long classId = alert.getClazz().getId();

        // requester must be creator OR instructor of the class
        boolean isCreator = alert.getCreatedBy() != null
                && alert.getCreatedBy().getEmail() != null
                && alert.getCreatedBy().getEmail().equals(requesterEmail);

        boolean isInstructor = classMemberRepo
                .existsByPerson_EmailAndClazz_IdAndRoleInClass(requesterEmail, classId, ClassRole.INSTRUCTOR);

        if (!(isCreator || isInstructor)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No permission to delete this alert");
        }

        alertRepo.delete(alert);
    }

    @Transactional
    public AlertDto setPinned(String requesterEmail, Long alertId, boolean pinned) {
        Alert alert = alertRepo.findById(alertId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alert not found"));

        Long classId = alert.getClazz().getId();

        // only instructors can pin/unpin
        boolean isInstructor = classMemberRepo
                .existsByPerson_EmailAndClazz_IdAndRoleInClass(requesterEmail, classId, ClassRole.INSTRUCTOR);

        if (!isInstructor) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can pin/unpin alerts");
        }

        alert.setPinned(pinned);
        // updatedAt handled by @PreUpdate on entity when saving; ensure flush via save
        return AlertDto.from(alertRepo.save(alert));
    }
}
