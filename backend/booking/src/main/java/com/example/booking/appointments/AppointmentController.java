package com.example.booking.appointments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointment Management", description = "APIs for managing appointments - the core table that joins everything together")
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a new appointment", 
               description = "Customers can book appointments with businesses for specific services. Only users with CUSTOMER role can create appointments.")
    public ResponseEntity<AppointmentDto> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentDto appointment = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID", 
               description = "Retrieves an appointment by its unique identifier. Accessible to the customer who booked it and the business owner.")
    public ResponseEntity<AppointmentDto> getAppointmentById(
            @Parameter(description = "Appointment ID", required = true) @PathVariable Long id) {
        AppointmentDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all appointments", 
               description = "Retrieves a list of all appointments. Admin only.")
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
        List<AppointmentDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get my appointments", 
               description = "Retrieves all appointments for the authenticated customer")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments() {
        List<AppointmentDto> appointments = appointmentService.getMyAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/my-business")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Get my business appointments", 
               description = "Retrieves all appointments for the authenticated business owner's businesses")
    public ResponseEntity<List<AppointmentDto>> getMyBusinessAppointments() {
        List<AppointmentDto> appointments = appointmentService.getMyBusinessAppointments();
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/business/{businessId}")
    @Operation(summary = "Get appointments by business", 
               description = "Retrieves all appointments for a specific business. Accessible to all authenticated users.")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByBusinessId(
            @Parameter(description = "Business ID", required = true) @PathVariable Long businessId) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByBusinessId(businessId);
        return ResponseEntity.ok(appointments);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get appointments by status", 
               description = "Retrieves appointments filtered by status. Customers see their own, business owners see their business appointments.")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByStatus(
            @Parameter(description = "Appointment status", required = true) @PathVariable AppointmentStatus status) {
        List<AppointmentDto> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status", 
               description = "Updates appointment status. Business owners can confirm/cancel/mark as done. Customers can only cancel their own appointments.")
    public ResponseEntity<AppointmentDto> updateAppointmentStatus(
            @Parameter(description = "Appointment ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UpdateAppointmentStatusRequest request) {
        AppointmentDto appointment = appointmentService.updateAppointmentStatus(id, request);
        return ResponseEntity.ok(appointment);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete appointment", 
               description = "Deletes an appointment. Customers can delete their own appointments. Business owners can delete appointments for their businesses.")
    public ResponseEntity<Void> deleteAppointment(
            @Parameter(description = "Appointment ID", required = true) @PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
