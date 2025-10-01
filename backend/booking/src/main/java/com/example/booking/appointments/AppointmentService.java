package com.example.booking.appointments;

import com.example.booking.auth.AuthenticationHelper;
import com.example.booking.businesses.Business;
import com.example.booking.businesses.BusinessRepository;
import com.example.booking.exceptions.BadRequestException;
import com.example.booking.exceptions.ForbiddenException;
import com.example.booking.exceptions.ResourceNotFoundException;
import com.example.booking.services.ServiceEntity;
import com.example.booking.services.ServiceRepository;
import com.example.booking.users.User;
import com.example.booking.users.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final BusinessRepository businessRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentMapper appointmentMapper;
    private final AuthenticationHelper authenticationHelper;
    
    public AppointmentService(AppointmentRepository appointmentRepository,
                             BusinessRepository businessRepository,
                             ServiceRepository serviceRepository,
                             AppointmentMapper appointmentMapper,
                             AuthenticationHelper authenticationHelper) {
        this.appointmentRepository = appointmentRepository;
        this.businessRepository = businessRepository;
        this.serviceRepository = serviceRepository;
        this.appointmentMapper = appointmentMapper;
        this.authenticationHelper = authenticationHelper;
    }
    
    // Create a new appointment - Only CUSTOMER role can book appointments
    public AppointmentDto createAppointment(CreateAppointmentRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        // Validate that the user has CUSTOMER role
        if (currentUser.getRole() != UserRole.CUSTOMER) {
            throw new ForbiddenException("Only users with CUSTOMER role can book appointments");
        }
        
        // Get and validate business
        Business business = businessRepository.findById(request.getBusinessId())
            .orElseThrow(() -> new ResourceNotFoundException("Business", "id", request.getBusinessId()));
        
        // Get and validate service
        ServiceEntity service = serviceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));
        
        // Validate that service belongs to the business
        if (!service.getBusiness().getId().equals(business.getId())) {
            throw new BadRequestException("Service does not belong to the specified business");
        }
        
        // Validate appointment time is in the future
        if (request.getDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Appointment date and time must be in the future");
        }
        
        // Check if time slot is already booked
        if (appointmentRepository.existsByBusinessIdAndDateTimeAndStatusNotCancelled(
                request.getBusinessId(), request.getDateTime())) {
            throw new BadRequestException("This time slot is already booked");
        }
        
        Appointment appointment = appointmentMapper.toEntity(request);
        appointment.setCustomer(currentUser);
        appointment.setBusiness(business);
        appointment.setService(service);
        appointment.setStatus(AppointmentStatus.PENDING);
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(savedAppointment);
    }
    
    // Get appointment by ID - Accessible to customer and business owner
    public AppointmentDto getAppointmentById(Long id) {
        User currentUser = authenticationHelper.getCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        // Check if user has access to this appointment
        boolean isCustomer = appointment.getCustomer().getId().equals(currentUser.getId());
        boolean isBusinessOwner = appointment.getBusiness().getOwner().getId().equals(currentUser.getId());
        
        if (!isCustomer && !isBusinessOwner && currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("You don't have permission to view this appointment");
        }
        
        return appointmentMapper.toDto(appointment);
    }
    
    // Get all appointments - Admin only
    public List<AppointmentDto> getAllAppointments() {
        User currentUser = authenticationHelper.getCurrentUser();
        
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only admins can view all appointments");
        }
        
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
            .map(appointmentMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get appointments for current user (customer's appointments)
    public List<AppointmentDto> getMyAppointments() {
        Long currentUserId = authenticationHelper.getCurrentUserId();
        List<Appointment> appointments = appointmentRepository.findByCustomerId(currentUserId);
        return appointments.stream()
            .map(appointmentMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get appointments for current user's businesses (business owner's appointments)
    public List<AppointmentDto> getMyBusinessAppointments() {
        User currentUser = authenticationHelper.getCurrentUser();
        
        if (currentUser.getRole() != UserRole.BUSINESS) {
            throw new ForbiddenException("Only business owners can view business appointments");
        }
        
        Long currentUserId = authenticationHelper.getCurrentUserId();
        List<Appointment> appointments = appointmentRepository.findByBusinessOwnerId(currentUserId);
        return appointments.stream()
            .map(appointmentMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get appointments by business ID - Accessible to all authenticated users
    public List<AppointmentDto> getAppointmentsByBusinessId(Long businessId) {
        List<Appointment> appointments = appointmentRepository.findByBusinessId(businessId);
        return appointments.stream()
            .map(appointmentMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Get appointments by status
    public List<AppointmentDto> getAppointmentsByStatus(AppointmentStatus status) {
        User currentUser = authenticationHelper.getCurrentUser();
        List<Appointment> appointments;
        
        if (currentUser.getRole() == UserRole.CUSTOMER) {
            appointments = appointmentRepository.findByCustomerIdAndStatus(currentUser.getId(), status);
        } else if (currentUser.getRole() == UserRole.BUSINESS) {
            appointments = appointmentRepository.findByBusinessOwnerId(currentUser.getId())
                .stream()
                .filter(a -> a.getStatus() == status)
                .collect(Collectors.toList());
        } else {
            appointments = appointmentRepository.findByStatus(status);
        }
        
        return appointments.stream()
            .map(appointmentMapper::toDto)
            .collect(Collectors.toList());
    }
    
    // Update appointment status - Business owner can confirm/cancel, customer can cancel
    public AppointmentDto updateAppointmentStatus(Long id, UpdateAppointmentStatusRequest request) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        boolean isCustomer = appointment.getCustomer().getId().equals(currentUser.getId());
        boolean isBusinessOwner = appointment.getBusiness().getOwner().getId().equals(currentUser.getId());
        
        // Validate permissions based on role and requested status
        if (isCustomer) {
            // Customer can only cancel their own appointments
            if (request.getStatus() != AppointmentStatus.CANCELLED) {
                throw new ForbiddenException("Customers can only cancel appointments");
            }
        } else if (isBusinessOwner) {
            // Business owner can confirm, cancel, or mark as done
            if (request.getStatus() != AppointmentStatus.CONFIRMED && 
                request.getStatus() != AppointmentStatus.CANCELLED && 
                request.getStatus() != AppointmentStatus.DONE) {
                throw new BadRequestException("Invalid status update");
            }
        } else {
            throw new ForbiddenException("You don't have permission to update this appointment");
        }
        
        // Validate status transitions
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled appointment");
        }
        
        if (appointment.getStatus() == AppointmentStatus.DONE) {
            throw new BadRequestException("Cannot update a completed appointment");
        }
        
        appointment.setStatus(request.getStatus());
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updatedAppointment);
    }
    
    // Delete appointment - Customer can delete their own, business owner can delete for their business
    public void deleteAppointment(Long id) {
        User currentUser = authenticationHelper.getCurrentUser();
        
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        boolean isCustomer = appointment.getCustomer().getId().equals(currentUser.getId());
        boolean isBusinessOwner = appointment.getBusiness().getOwner().getId().equals(currentUser.getId());
        
        if (!isCustomer && !isBusinessOwner && currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("You don't have permission to delete this appointment");
        }
        
        appointmentRepository.delete(appointment);
    }
}
