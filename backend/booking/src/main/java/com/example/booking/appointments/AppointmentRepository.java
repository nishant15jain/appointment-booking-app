package com.example.booking.appointments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Get appointments by customer
    List<Appointment> findByCustomerId(Long customerId);
    
    // Get appointments by business
    List<Appointment> findByBusinessId(Long businessId);
    
    // Get appointments by business owner
    @Query("SELECT a FROM Appointment a WHERE a.business.owner.id = :ownerId")
    List<Appointment> findByBusinessOwnerId(@Param("ownerId") Long ownerId);
    
    // Get appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);
    
    // Get appointments by customer and status
    List<Appointment> findByCustomerIdAndStatus(Long customerId, AppointmentStatus status);
    
    // Get appointments by business and status
    List<Appointment> findByBusinessIdAndStatus(Long businessId, AppointmentStatus status);
    
    // Get appointments within a date range for a business
    @Query("SELECT a FROM Appointment a WHERE a.business.id = :businessId AND a.dateTime BETWEEN :startDate AND :endDate")
    List<Appointment> findByBusinessIdAndDateTimeBetween(
        @Param("businessId") Long businessId, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );
    
    // Check if appointment time slot is available
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.business.id = :businessId AND a.dateTime = :dateTime AND a.status NOT IN ('CANCELLED')")
    boolean existsByBusinessIdAndDateTimeAndStatusNotCancelled(
        @Param("businessId") Long businessId, 
        @Param("dateTime") LocalDateTime dateTime
    );
    
    // Find appointment by ID and customer ID (for customer ownership validation)
    Optional<Appointment> findByIdAndCustomerId(Long id, Long customerId);
    
    // Find appointment by ID and business owner ID (for business owner validation)
    @Query("SELECT a FROM Appointment a WHERE a.id = :id AND a.business.owner.id = :ownerId")
    Optional<Appointment> findByIdAndBusinessOwnerId(@Param("id") Long id, @Param("ownerId") Long ownerId);
}
