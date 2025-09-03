package com.example.learnspace.repository;

import com.example.learnspace.model.entity.ClassMember;
import com.example.learnspace.model.entity.ClassRoom;
import com.example.learnspace.model.enums.ClassRole;   // <-- add this
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {

    @Query("""
        select cm.clazz
        from ClassMember cm
        where cm.person.email = :email
    """)
    List<ClassRoom> findClassesByPersonEmail(@Param("email") String email);

    // for cascade-like cleanup when deleting a class
    long deleteByClazz_Id(Long classId);

    // check if a user is an INSTRUCTOR (or other role) in a class
    boolean existsByPerson_EmailAndClazz_IdAndRoleInClass(
            String email, Long classId, ClassRole roleInClass
    );

    // fetch the membership row (useful for permission checks)
    Optional<ClassMember> findByPerson_EmailAndClazz_Id(String email, Long classId);
}
