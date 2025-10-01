package com.example.booking.businesses;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BusinessDto {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private String description;
    private String location;
    private LocalDateTime createdAt;
}
