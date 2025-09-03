package com.example.learnspace.repository;

import com.example.learnspace.model.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    // Add custom finders if you need (e.g., Optional<ClassRoom> findByCode(String code));
    Optional<ClassRoom> findByIdAndCreatedBy_Email(Long id, String email);
}

