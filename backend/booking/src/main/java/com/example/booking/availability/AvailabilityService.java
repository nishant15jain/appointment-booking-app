package com.example.booking.availability;

import com.example.booking.auth.AuthenticationHelper;
import com.example.booking.businesses.Business;
import com.example.booking.businesses.BusinessRepository;
import com.example.booking.exceptions.BadRequestException;
import com.example.booking.exceptions.ForbiddenException;
import com.example.booking.exceptions.ResourceNotFoundException;
import com.example.booking.users.User;
import com.example.booking.users.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AvailabilityService {
    
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final BusinessRepository businessRepository;
    private final AvailabilitySlotMapper availabilitySlotMapper;
    private final AuthenticationHelper authenticationHelper;
    
    public AvailabilityService(AvailabilitySlotRepository availabilitySlotRepository,
                              BusinessRepository businessRepository,
                              AvailabilitySlotMapper availabilitySlotMapper,
                              AuthenticationHelper authenticationHelper) {
        this.availabilitySlotRepository = availabilitySlotRepository;
        this.businessRepository = businessRepository;
        this.availabilitySlotMapper = availabilitySlotMapper;
        this.authenticationHelper = authenticationHelper;
    }
    
    // Create a new availability slot for a business Only the business owner can create slots for their business
    public AvailabilitySlotDto createAvailabilitySlot(CreateAvailabilitySlotRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        // Validate that the user has BUSINESS role
        if (currentUser.getRole() != UserRole.BUSINESS) {
            throw new ForbiddenException("Only users with BUSINESS role can create availability slots");
        }
        
        // Get the business and verify ownership
        Business business = businessRepository.findById(request.getBusinessId())
            .orElseThrow(() -> new ResourceNotFoundException("Business", "id", request.getBusinessId()));
        
        if (!business.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only create availability slots for your own businesses");
        }
        
        // Validate date range
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after or equal to start date");
        }
        
        // Validate time range
        if (request.getEndTime().isBefore(request.getStartTime()) || 
            request.getEndTime().equals(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        
        AvailabilitySlot availabilitySlot = availabilitySlotMapper.toEntity(request);
        availabilitySlot.setBusiness(business);
        
        AvailabilitySlot savedSlot = availabilitySlotRepository.save(availabilitySlot);
        return availabilitySlotMapper.toDto(savedSlot);
    }
    
    // Get an availability slot by ID Accessible to all authenticated users
    public AvailabilitySlotDto getAvailabilitySlotById(Long id) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AvailabilitySlot", "id", id));
        return availabilitySlotMapper.toDto(slot);
    }
    
    // Get all availability slots Accessible to all authenticated users
    public List<AvailabilitySlotDto> getAllAvailabilitySlots() {
        List<AvailabilitySlot> slots = availabilitySlotRepository.findAll();
        return slots.stream()
            .map(availabilitySlotMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get all availability slots for a specific business Accessible to all authenticated users
    public List<AvailabilitySlotDto> getAvailabilitySlotsByBusinessId(Long businessId) {
        List<AvailabilitySlot> slots = availabilitySlotRepository.findByBusinessId(businessId);
        return slots.stream()
            .map(availabilitySlotMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get all availability slots created by the current user (for their businesses) Only for BUSINESS users
    public List<AvailabilitySlotDto> getMyAvailabilitySlots() {
        Long currentUserId = authenticationHelper.getCurrentUserId();
        List<AvailabilitySlot> slots = availabilitySlotRepository.findByBusinessOwnerId(currentUserId);
        return slots.stream()
            .map(availabilitySlotMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Update an availability slot Only the business owner can update their slots
    public AvailabilitySlotDto updateAvailabilitySlot(Long id, UpdateAvailabilitySlotRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        AvailabilitySlot slot = availabilitySlotRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AvailabilitySlot", "id", id));
        
        // Verify ownership through the business
        if (!slot.getBusiness().getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only update availability slots for your own businesses");
        }
        
        // Validate date range if both dates are provided
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("End date must be after or equal to start date");
            }
        }
        
        // Validate time range if both times are provided
        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getEndTime().isBefore(request.getStartTime()) || 
                request.getEndTime().equals(request.getStartTime())) {
                throw new BadRequestException("End time must be after start time");
            }
        }
        
        availabilitySlotMapper.updateEntity(request, slot);
        AvailabilitySlot updatedSlot = availabilitySlotRepository.save(slot);
        return availabilitySlotMapper.toDto(updatedSlot);
    }
    
    // Delete an availability slot Only the business owner can delete their slots
    public void deleteAvailabilitySlot(Long id) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        AvailabilitySlot slot = availabilitySlotRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("AvailabilitySlot", "id", id));
        
        // Verify ownership through the business
        if (!slot.getBusiness().getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only delete availability slots for your own businesses");
        }
        
        availabilitySlotRepository.delete(slot);
    }
}
