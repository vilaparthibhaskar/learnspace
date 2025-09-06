// src/main/java/com/example/learnspace/repository/SubmissionRepository.java
package com.example.learnspace.repository;

import com.example.learnspace.model.entity.Submission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /**
     * Load submissions for a student by email, newest first.
     * EntityGraph avoids N+1 when mapping to DTO.
     */
    @EntityGraph(attributePaths = {"assignment", "assignment.clazz"})
    List<Submission> findByStudent_EmailOrderBySubmittedAtDesc(String email);

    // my submissions for a class
    @Query("""
      select s
      from Submission s
      join s.assignment a
      join a.clazz c
      where s.student.email = :email
        and c.id = :classId
      order by s.submittedAt desc
    """)
    List<Submission> findMyInClass(String email, Long classId);

    // used to notify instructors/admins for a class
    @Query("""
      select s
      from Submission s
      join s.assignment a
      where a.id = :assignmentId
    """)
    List<Submission> findByAssignmentId(Long assignmentId);

    // NEW: all submissions in a class, newest first
    List<Submission> findByAssignment_Clazz_IdOrderBySubmittedAtDesc(Long classId);
}
