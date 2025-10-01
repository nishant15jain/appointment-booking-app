package com.example.booking.businesses;

import lombok.Data;

@Data
public class UpdateBusinessRequest {
    private String name;
    private String description;
    private String location;
}
