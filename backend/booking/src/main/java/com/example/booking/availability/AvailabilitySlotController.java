package com.example.booking.availability;

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
@RequestMapping("/api/availability-slots")
@Tag(name = "Availability Slot Management", description = "APIs for managing business availability slots (date range based schedule)")
public class AvailabilitySlotController {
    
    private final AvailabilityService availabilityService;
    
    public AvailabilitySlotController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Create a new availability slot", 
               description = "Creates a new availability slot for a business. Only the business owner can create slots for their own businesses.")
    public ResponseEntity<AvailabilitySlotDto> createAvailabilitySlot(@Valid @RequestBody CreateAvailabilitySlotRequest request) {
        AvailabilitySlotDto slot = availabilityService.createAvailabilitySlot(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(slot);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get availability slot by ID", 
               description = "Retrieves an availability slot by its unique identifier. Accessible to all authenticated users.")
    public ResponseEntity<AvailabilitySlotDto> getAvailabilitySlotById(
            @Parameter(description = "Availability Slot ID", required = true) @PathVariable Long id) {
        AvailabilitySlotDto slot = availabilityService.getAvailabilitySlotById(id);
        return ResponseEntity.ok(slot);
    }
    
    @GetMapping
    @Operation(summary = "Get all availability slots", 
               description = "Retrieves a list of all availability slots. Accessible to all authenticated users.")
    public ResponseEntity<List<AvailabilitySlotDto>> getAllAvailabilitySlots() {
        List<AvailabilitySlotDto> slots = availabilityService.getAllAvailabilitySlots();
        return ResponseEntity.ok(slots);
    }
    
    @GetMapping("/business/{businessId}")
    @Operation(summary = "Get availability slots by business", 
               description = "Retrieves all availability slots for a specific business. Accessible to all authenticated users.")
    public ResponseEntity<List<AvailabilitySlotDto>> getAvailabilitySlotsByBusinessId(
            @Parameter(description = "Business ID", required = true) @PathVariable Long businessId) {
        List<AvailabilitySlotDto> slots = availabilityService.getAvailabilitySlotsByBusinessId(businessId);
        return ResponseEntity.ok(slots);
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Get my availability slots", 
               description = "Retrieves all availability slots created by the authenticated business owner for their businesses")
    public ResponseEntity<List<AvailabilitySlotDto>> getMyAvailabilitySlots() {
        List<AvailabilitySlotDto> slots = availabilityService.getMyAvailabilitySlots();
        return ResponseEntity.ok(slots);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Update availability slot", 
               description = "Updates an existing availability slot. Only the business owner can update slots for their own businesses.")
    public ResponseEntity<AvailabilitySlotDto> updateAvailabilitySlot(
            @Parameter(description = "Availability Slot ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UpdateAvailabilitySlotRequest request) {
        AvailabilitySlotDto slot = availabilityService.updateAvailabilitySlot(id, request);
        return ResponseEntity.ok(slot);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Delete availability slot", 
               description = "Deletes an availability slot. Only the business owner can delete slots for their own businesses.")
    public ResponseEntity<Void> deleteAvailabilitySlot(
            @Parameter(description = "Availability Slot ID", required = true) @PathVariable Long id) {
        availabilityService.deleteAvailabilitySlot(id);
        return ResponseEntity.noContent().build();
    }
}
