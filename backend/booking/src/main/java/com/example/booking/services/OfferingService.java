package com.example.booking.services;

import com.example.booking.auth.AuthenticationHelper;
import com.example.booking.businesses.Business;
import com.example.booking.businesses.BusinessRepository;
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
public class OfferingService {
    
    private final ServiceRepository serviceRepository;
    private final BusinessRepository businessRepository;
    private final ServiceMapper serviceMapper;
    private final AuthenticationHelper authenticationHelper;
    
    public OfferingService(ServiceRepository serviceRepository,
                          BusinessRepository businessRepository,
                          ServiceMapper serviceMapper,
                          AuthenticationHelper authenticationHelper) {
        this.serviceRepository = serviceRepository;
        this.businessRepository = businessRepository;
        this.serviceMapper = serviceMapper;
        this.authenticationHelper = authenticationHelper;
    }
    
    
    // Create a new service for a business Only the business owner can create services for their business
    public ServiceDto createService(CreateServiceRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        // Validate that the user has BUSINESS role
        if (currentUser.getRole() != UserRole.BUSINESS) {
            throw new ForbiddenException("Only users with BUSINESS role can create services");
        }
        
        // Get the business and verify ownership
        Business business = businessRepository.findById(request.getBusinessId())
            .orElseThrow(() -> new ResourceNotFoundException("Business", "id", request.getBusinessId()));
        
        if (!business.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only create services for your own businesses");
        }
        
        ServiceEntity serviceEntity = serviceMapper.toEntity(request);
        serviceEntity.setBusiness(business);
        
        ServiceEntity savedService = serviceRepository.save(serviceEntity);
        return serviceMapper.toDto(savedService);
    }
    
    // Get a service by ID Accessible to all authenticated users
    public ServiceDto getServiceById(Long id) {
        ServiceEntity service = serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        return serviceMapper.toDto(service);
    }
    
    // Get all services Accessible to all authenticated users
    public List<ServiceDto> getAllServices() {
        List<ServiceEntity> services = serviceRepository.findAll();
        return services.stream()
            .map(serviceMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get all services for a specific business Accessible to all authenticated users
    public List<ServiceDto> getServicesByBusinessId(Long businessId) {
        List<ServiceEntity> services = serviceRepository.findByBusinessId(businessId);
        return services.stream()
            .map(serviceMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get all services created by the current user (for their businesses) Only for BUSINESS users
    public List<ServiceDto> getMyServices() {
        Long currentUserId = authenticationHelper.getCurrentUserId();
        List<ServiceEntity> services = serviceRepository.findByBusinessOwnerId(currentUserId);
        return services.stream()
            .map(serviceMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Search services by name Accessible to all authenticated users
    public List<ServiceDto> searchServicesByName(String name) {
        List<ServiceEntity> services = serviceRepository.findByNameContaining(name);
        return services.stream()
            .map(serviceMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Update a service Only the business owner can update their services
    public ServiceDto updateService(Long id, UpdateServiceRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        ServiceEntity service = serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        // Verify ownership through the business
        if (!service.getBusiness().getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only update services for your own businesses");
        }
        
        serviceMapper.updateEntity(request, service);
        ServiceEntity updatedService = serviceRepository.save(service);
        return serviceMapper.toDto(updatedService);
    }
    
    // Delete a service Only the business owner can delete their services
    public void deleteService(Long id) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        ServiceEntity service = serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        // Verify ownership through the business
        if (!service.getBusiness().getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only delete services for your own businesses");
        }
        
        serviceRepository.delete(service);
    }
}
