package com.example.booking.services;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateServiceRequest {
    
    @NotNull(message = "Business ID is required")
    private Long businessId;
    
    @NotBlank(message = "Service name is required")
    private String name;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;
    
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal price;
}
