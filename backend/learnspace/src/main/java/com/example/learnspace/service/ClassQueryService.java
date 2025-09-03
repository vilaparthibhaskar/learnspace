package com.example.learnspace.service;

// src/main/java/com/learnspace/service/ClassQueryService.java
import com.example.learnspace.dto.ClassRoomDto;
import com.example.learnspace.model.entity.ClassMember;
import com.example.learnspace.model.entity.ClassRoom;
import com.example.learnspace.model.entity.Person;
import com.example.learnspace.model.enums.ClassRole;
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
public class ClassQueryService {

    private final ClassMemberRepository classMemberRepo;
    private final PersonRepository personRepo;
    private final ClassRoomRepository classRoomRepo; // <-- add this

    @Transactional(readOnly = true)
    public List<ClassRoomDto> getMyClassesByEmail(String email) {
        Person person = personRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        List<ClassRoom> classes = classMemberRepo.findClassesByPersonEmail(email);
        return classes.stream().map(ClassRoomDto::from).toList();
    }

    @Transactional
    public ClassRoomDto createClassForOwner(String ownerEmail, String name, String description, String code) {
        // 1) Find the owner
        Person owner = personRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found: " + ownerEmail));

        // 2) Create & save the ClassRoom (use setters; works with @Data or typical entities)
        ClassRoom room = new ClassRoom();
        room.setTitle(name);
        room.setDescription(description);
        room.setCreatedBy(owner);
        room.setCode(code);
        // If your entity has timestamps/audit fields, set them here (optional)
        // room.setCreatedAt(Instant.now());
        // room.setCreatedBy(owner);

        room = classRoomRepo.save(room);

        // 3) Add creator as INSTRUCTOR in class_members
        ClassMember membership = ClassMember.builder()
                .clazz(room)                           // your field name is 'clazz'
                .person(owner)
                .roleInClass(ClassRole.INSTRUCTOR)
                .joinedAt(Instant.now())
                .build();
        classMemberRepo.save(membership);

        // 4) Return DTO
        return ClassRoomDto.from(room);
    }


    @Transactional
    public void deleteClassOwnedBy(String ownerEmail, Long classId) {
        // ensure owner exists (useful to give a clear error)
        personRepo.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Owner not found: " + ownerEmail));

        // fetch the class and ensure ownership
        var room = classRoomRepo.findByIdAndCreatedBy_Email(classId, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "You are not the owner or class doesn't exist"));

        // remove memberships first if your DB doesn’t have ON DELETE CASCADE
        // (safe on both cases; if FK has cascade, this will just delete rows explicitly)
        classMemberRepo.deleteByClazz_Id(classId);

        // delete the class
        classRoomRepo.delete(room);
    }
}
