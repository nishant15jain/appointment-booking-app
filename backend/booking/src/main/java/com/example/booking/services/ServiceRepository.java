package com.example.booking.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    
    List<ServiceEntity> findByBusinessId(Long businessId);
    
    @Query("SELECT s FROM ServiceEntity s WHERE s.name LIKE %:name%")
    List<ServiceEntity> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT s FROM ServiceEntity s WHERE s.business.id = :businessId AND s.id = :id")
    Optional<ServiceEntity> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);
    
    @Query("SELECT s FROM ServiceEntity s WHERE s.business.owner.id = :ownerId")
    List<ServiceEntity> findByBusinessOwnerId(@Param("ownerId") Long ownerId);
}
