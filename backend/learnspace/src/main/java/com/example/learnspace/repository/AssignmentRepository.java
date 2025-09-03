package com.example.learnspace.repository;

import com.example.learnspace.model.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClazz_IdOrderByDueAtAsc(Long classId);
}
