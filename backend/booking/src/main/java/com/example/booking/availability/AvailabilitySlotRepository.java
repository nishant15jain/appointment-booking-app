package com.example.booking.availability;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {
    
    // Get all availability slots for a specific business
    List<AvailabilitySlot> findByBusinessId(Long businessId);
    
    // Get availability slots by business owner
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.business.owner.id = :ownerId")
    List<AvailabilitySlot> findByBusinessOwnerId(@Param("ownerId") Long ownerId);
    
    // Find by ID and business ID (for ownership validation)
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.id = :id AND a.business.id = :businessId")
    Optional<AvailabilitySlot> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);
}
