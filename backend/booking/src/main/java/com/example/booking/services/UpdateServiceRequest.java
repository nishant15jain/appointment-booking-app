package com.example.booking.services;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateServiceRequest {
    
    private String name;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;
    
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal price;
}
