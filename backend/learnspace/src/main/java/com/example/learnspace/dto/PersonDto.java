// src/main/java/com/example/learnspace/dto/PersonDto.java
package com.example.learnspace.dto;

import com.example.learnspace.model.entity.Person;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class PersonDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role;
    private Instant createdAt;
    private Instant updatedAt;

    public static PersonDto from(Person p) {
        return new PersonDto(
                p.getId(),
                p.getName(),
                p.getEmail(),
                p.getPhone(),
                p.getAddress(),
                p.getRole(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
