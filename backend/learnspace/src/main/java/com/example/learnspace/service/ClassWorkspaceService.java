package com.example.learnspace.service;

import com.example.learnspace.dto.AssignmentDto;
import com.example.learnspace.dto.ClassDetailDto;
import com.example.learnspace.dto.ClassMemberDto;
import com.example.learnspace.model.entity.ClassMember;
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

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassWorkspaceService {

    private final ClassRoomRepository classRoomRepo;
    private final ClassMemberRepository classMemberRepo;
    private final AssignmentRepository assignmentRepo;
    private final PersonRepository personRepo;

    @Transactional(readOnly = true)
    public ClassDetailDto getClassDetail(Long classId, String callerEmail) {
        ClassRoom c = classRoomRepo.findById(classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Class not found"));

        String createdByEmail = c.getCreatedBy() != null ? c.getCreatedBy().getEmail() : null;
        String myRole = null;
        if (callerEmail != null && !callerEmail.isBlank()) {
            myRole = classMemberRepo.findByPerson_EmailAndClazz_Id(callerEmail, classId)
                    .map(cm -> cm.getRoleInClass().name())
                    .orElse(null);
        }
        return ClassDetailDto.from(c, createdByEmail, myRole);
    }

    @Transactional(readOnly = true)
    public List<ClassMemberDto> getMembers(Long classId) {
        List<ClassMember> list = classMemberRepo.findAll().stream()
                .filter(cm -> cm.getClazz().getId().equals(classId))
                .toList();
        return list.stream().map(ClassMemberDto::from).toList();
    }

    @Transactional
    public ClassMemberDto addMember(Long classId, String requesterEmail, String newMemberEmail, ClassRole role) {
        // only INSTRUCTOR can add
        var requester = classMemberRepo.findByPerson_EmailAndClazz_Id(requesterEmail, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
        if (requester.getRoleInClass() != ClassRole.INSTRUCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can add members");
        }

        ClassRoom clazz = requester.getClazz(); // already loaded via requester
        Person person = personRepo.findByEmail(newMemberEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + newMemberEmail));

        // prevent duplicates (unique constraint also exists)
        boolean already = classMemberRepo.findByPerson_EmailAndClazz_Id(newMemberEmail, classId).isPresent();
        if (already) throw new ResponseStatusException(HttpStatus.CONFLICT, "User already in class");

        ClassMember cm = ClassMember.builder()
                .clazz(clazz)
                .person(person)
                .roleInClass(role == null ? ClassRole.STUDENT : role)
                .joinedAt(Instant.now())
                .build();
        cm = classMemberRepo.save(cm);
        return ClassMemberDto.from(cm);
    }

    @Transactional
    public ClassMemberDto updateMemberRole(Long classId, Long memberId, String requesterEmail, ClassRole role) {
        var requester = classMemberRepo.findByPerson_EmailAndClazz_Id(requesterEmail, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
        if (requester.getRoleInClass() != ClassRole.INSTRUCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can change roles");
        }

        ClassMember cm = classMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
        if (!cm.getClazz().getId().equals(classId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Member not in this class");
        }

        cm.setRoleInClass(role == null ? ClassRole.STUDENT : role);
        return ClassMemberDto.from(classMemberRepo.save(cm));
    }

    @Transactional
    public void removeMember(Long classId, Long memberId, String requesterEmail) {
        var requester = classMemberRepo.findByPerson_EmailAndClazz_Id(requesterEmail, classId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a member"));
        if (requester.getRoleInClass() != ClassRole.INSTRUCTOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only instructors can remove members");
        }

        ClassMember cm = classMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
        if (!cm.getClazz().getId().equals(classId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Member not in this class");
        }
        classMemberRepo.delete(cm);
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignments(Long classId) {
        return assignmentRepo.findByClazz_IdOrderByDueAtAsc(classId)
                .stream().map(AssignmentDto::from).toList();
    }
}
