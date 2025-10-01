package com.example.booking.businesses;

import com.example.booking.auth.AuthenticationHelper;
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
public class BusinessService {
    
    private final BusinessRepository businessRepository;
    private final BusinessMapper businessMapper;
    private final AuthenticationHelper authenticationHelper;
    
    public BusinessService(BusinessRepository businessRepository, 
                          BusinessMapper businessMapper,
                          AuthenticationHelper authenticationHelper) {
        this.businessRepository = businessRepository;
        this.businessMapper = businessMapper;
        this.authenticationHelper = authenticationHelper;
    }
    
    public BusinessDto createBusiness(CreateBusinessRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        // Validate that the user has BUSINESS role
        if (currentUser.getRole() != UserRole.BUSINESS) {
            throw new ForbiddenException("Only users with BUSINESS role can create businesses");
        }
        
        Business business = businessMapper.toEntity(request);
        business.setOwner(currentUser);
        
        Business savedBusiness = businessRepository.save(business);
        return businessMapper.toDto(savedBusiness);
    }
    
    public BusinessDto getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Business", "id", id));
        return businessMapper.toDto(business);
    }
    
    public List<BusinessDto> getAllBusinesses() {
        List<Business> businesses = businessRepository.findAll();
        return businesses.stream()
            .map(businessMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public List<BusinessDto> getBusinessesByOwner(Long ownerId) {
        List<Business> businesses = businessRepository.findByOwnerId(ownerId);
        return businesses.stream()
            .map(businessMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public List<BusinessDto> searchBusinessesByName(String name) {
        List<Business> businesses = businessRepository.findByNameContaining(name);
        return businesses.stream()
            .map(businessMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public List<BusinessDto> searchBusinessesByLocation(String location) {
        List<Business> businesses = businessRepository.findByLocationContaining(location);
        return businesses.stream()
            .map(businessMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public BusinessDto updateBusiness(Long id, UpdateBusinessRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        Business business = businessRepository.findByIdAndOwnerId(id, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id + " or you don't have permission to update it"));
        
        businessMapper.updateEntity(request, business);
        Business updatedBusiness = businessRepository.save(business);
        return businessMapper.toDto(updatedBusiness);
    }
    
    public void deleteBusiness(Long id) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        Business business = businessRepository.findByIdAndOwnerId(id, currentUser.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id + " or you don't have permission to delete it"));
        
        businessRepository.delete(business);
    }
    
    public List<BusinessDto> getMyBusinesses() {
        Long currentUserId = authenticationHelper.getCurrentUserId();
        List<Business> businesses = businessRepository.findByOwnerId(currentUserId);
        return businesses.stream()
            .map(businessMapper::toDto)
            .collect(Collectors.toList());
    }
}
