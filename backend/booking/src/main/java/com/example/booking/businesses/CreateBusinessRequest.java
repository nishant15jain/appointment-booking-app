package com.example.booking.businesses;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBusinessRequest {
    
    @NotBlank(message = "Business name is required")
    private String name;
    
    private String description;
    
    private String location;
}
