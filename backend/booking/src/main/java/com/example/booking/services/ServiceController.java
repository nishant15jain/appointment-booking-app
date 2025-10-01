package com.example.booking.services;

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
@RequestMapping("/api/services")
@Tag(name = "Service Management", description = "APIs for managing services offered by businesses")
public class ServiceController {
    
    private final OfferingService offeringService;
    
    public ServiceController(OfferingService offeringService) {
        this.offeringService = offeringService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Create a new service", 
               description = "Creates a new service for a business. Only the business owner can create services for their own businesses.")
    public ResponseEntity<ServiceDto> createService(@Valid @RequestBody CreateServiceRequest request) {
        ServiceDto service = offeringService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(service);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID", 
               description = "Retrieves a service by its unique identifier. Accessible to all authenticated users.")
    public ResponseEntity<ServiceDto> getServiceById(
            @Parameter(description = "Service ID", required = true) @PathVariable Long id) {
        ServiceDto service = offeringService.getServiceById(id);
        return ResponseEntity.ok(service);
    }
    
    @GetMapping
    @Operation(summary = "Get all services", 
               description = "Retrieves a list of all services. Accessible to all authenticated users.")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        List<ServiceDto> services = offeringService.getAllServices();
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/business/{businessId}")
    @Operation(summary = "Get services by business", 
               description = "Retrieves all services offered by a specific business. Accessible to all authenticated users.")
    public ResponseEntity<List<ServiceDto>> getServicesByBusinessId(
            @Parameter(description = "Business ID", required = true) @PathVariable Long businessId) {
        List<ServiceDto> services = offeringService.getServicesByBusinessId(businessId);
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Get my services", 
               description = "Retrieves all services created by the authenticated business owner for their businesses")
    public ResponseEntity<List<ServiceDto>> getMyServices() {
        List<ServiceDto> services = offeringService.getMyServices();
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/search/name")
    @Operation(summary = "Search services by name", 
               description = "Searches for services containing the specified name. Accessible to all authenticated users.")
    public ResponseEntity<List<ServiceDto>> searchServicesByName(
            @Parameter(description = "Name to search for", required = true) @RequestParam String name) {
        List<ServiceDto> services = offeringService.searchServicesByName(name);
        return ResponseEntity.ok(services);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Update service", 
               description = "Updates an existing service. Only the business owner can update services for their own businesses.")
    public ResponseEntity<ServiceDto> updateService(
            @Parameter(description = "Service ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequest request) {
        ServiceDto service = offeringService.updateService(id, request);
        return ResponseEntity.ok(service);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Delete service", 
               description = "Deletes a service. Only the business owner can delete services for their own businesses.")
    public ResponseEntity<Void> deleteService(
            @Parameter(description = "Service ID", required = true) @PathVariable Long id) {
        offeringService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
