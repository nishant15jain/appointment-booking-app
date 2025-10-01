package com.example.booking.appointments;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAppointmentStatusRequest {
    
    @NotNull(message = "Status is required")
    private AppointmentStatus status;
}
