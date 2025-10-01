package com.example.booking.appointments;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long businessId;
    private String businessName;
    private Long serviceId;
    private String serviceName;
    private Integer serviceDuration;
    private LocalDateTime dateTime;
    private AppointmentStatus status;
    private LocalDateTime createdAt;
}
