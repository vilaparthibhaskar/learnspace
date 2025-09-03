package com.example.learnspace.dto;


import com.example.learnspace.model.entity.ClassRoom;

public record ClassRoomDto(
        Long id,
        String title,
        String code,
        String description,
        com.example.learnspace.model.enums.ClassStatus status
) {
    public static ClassRoomDto from(ClassRoom c) {
        // Adjust getters to your actual field names on ClassRoom
        return new ClassRoomDto(
                c.getId(),
                c.getTitle(),
                c.getCode(),
                c.getDescription(),
                c.getStatus()
        );
    }
}

