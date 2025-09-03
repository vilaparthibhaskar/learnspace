package com.example.learnspace.dto;

import com.example.learnspace.model.entity.ClassMember;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class ClassMemberDto {
    private Long id;            // membership id
    private Long personId;
    private String personName;
    private String personEmail;
    private String roleInClass; // INSTRUCTOR / STUDENT
    private Instant joinedAt;

    public static ClassMemberDto from(ClassMember cm) {
        return new ClassMemberDto(
                cm.getId(),
                cm.getPerson().getId(),
                cm.getPerson().getName(),
                cm.getPerson().getEmail(),
                cm.getRoleInClass().name(),
                cm.getJoinedAt()
        );
    }
}
