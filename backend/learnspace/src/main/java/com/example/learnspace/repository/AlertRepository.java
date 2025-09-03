// src/main/java/com/example/learnspace/repository/AlertRepository.java
package com.example.learnspace.repository;

import com.example.learnspace.model.entity.Alert;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Alerts visible to a user = alerts for classes where the user is a member
    @EntityGraph(attributePaths = {"clazz", "createdBy"})
    @Query("""
      select a
      from Alert a
      join ClassMember cm on cm.clazz = a.clazz
      where cm.person.email = :email
      order by a.pinned desc, a.createdAt desc
    """)
    List<Alert> findAllVisibleToUser(String email);

    // Alerts for a specific class (e.g., class detail page)
    @EntityGraph(attributePaths = {"clazz", "createdBy"})
    List<Alert> findByClazz_IdOrderByPinnedDescCreatedAtDesc(Long classId);
}
