package com.example.booking.businesses;

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
@RequestMapping("/api/businesses")
@Tag(name = "Business Management", description = "APIs for managing businesses in the appointment booking system")
public class BusinessController {
    
    private final BusinessService businessService;
    
    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Create a new business", 
               description = "Creates a new business for the authenticated business owner. Only users with BUSINESS role can create businesses.")
    public ResponseEntity<BusinessDto> createBusiness(@Valid @RequestBody CreateBusinessRequest request) {
        BusinessDto business = businessService.createBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(business);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get business by ID", 
               description = "Retrieves a business by its unique identifier. Accessible to all authenticated users.")
    public ResponseEntity<BusinessDto> getBusinessById(
            @Parameter(description = "Business ID", required = true) @PathVariable Long id) {
        BusinessDto business = businessService.getBusinessById(id);
        return ResponseEntity.ok(business);
    }
    
    @GetMapping
    @Operation(summary = "Get all businesses", 
               description = "Retrieves a list of all businesses. Accessible to all authenticated users.")
    public ResponseEntity<List<BusinessDto>> getAllBusinesses() {
        List<BusinessDto> businesses = businessService.getAllBusinesses();
        return ResponseEntity.ok(businesses);
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Get my businesses", 
               description = "Retrieves all businesses owned by the authenticated business owner")
    public ResponseEntity<List<BusinessDto>> getMyBusinesses() {
        List<BusinessDto> businesses = businessService.getMyBusinesses();
        return ResponseEntity.ok(businesses);
    }
    
    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get businesses by owner", 
               description = "Retrieves all businesses owned by a specific user. Accessible to all authenticated users.")
    public ResponseEntity<List<BusinessDto>> getBusinessesByOwner(
            @Parameter(description = "Owner ID", required = true) @PathVariable Long ownerId) {
        List<BusinessDto> businesses = businessService.getBusinessesByOwner(ownerId);
        return ResponseEntity.ok(businesses);
    }
    
    @GetMapping("/search/name")
    @Operation(summary = "Search businesses by name", 
               description = "Searches for businesses containing the specified name. Accessible to all authenticated users.")
    public ResponseEntity<List<BusinessDto>> searchBusinessesByName(
            @Parameter(description = "Name to search for", required = true) @RequestParam String name) {
        List<BusinessDto> businesses = businessService.searchBusinessesByName(name);
        return ResponseEntity.ok(businesses);
    }
    
    @GetMapping("/search/location")
    @Operation(summary = "Search businesses by location", 
               description = "Searches for businesses containing the specified location. Accessible to all authenticated users.")
    public ResponseEntity<List<BusinessDto>> searchBusinessesByLocation(
            @Parameter(description = "Location to search for", required = true) @RequestParam String location) {
        List<BusinessDto> businesses = businessService.searchBusinessesByLocation(location);
        return ResponseEntity.ok(businesses);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Update business", 
               description = "Updates an existing business. Only the business owner can update their own business.")
    public ResponseEntity<BusinessDto> updateBusiness(
            @Parameter(description = "Business ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UpdateBusinessRequest request) {
        BusinessDto business = businessService.updateBusiness(id, request);
        return ResponseEntity.ok(business);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    @Operation(summary = "Delete business", 
               description = "Deletes a business. Only the business owner can delete their own business.")
    public ResponseEntity<Void> deleteBusiness(
            @Parameter(description = "Business ID", required = true) @PathVariable Long id) {
        businessService.deleteBusiness(id);
        return ResponseEntity.noContent().build();
    }
}