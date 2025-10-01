package com.example.booking.services;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ServiceDto {
    private Long id;
    private Long businessId;
    private String businessName;
    private String name;
    private Integer durationMinutes;
    private BigDecimal price;
    private LocalDateTime createdAt;
}
