package com.example.booking.businesses;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BusinessRepository extends JpaRepository<Business, Long> {
    
    List<Business> findByOwnerId(Long ownerId);
    
    @Query("SELECT b FROM Business b WHERE b.name LIKE %:name%")
    List<Business> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT b FROM Business b WHERE b.location LIKE %:location%")
    List<Business> findByLocationContaining(@Param("location") String location);
    
    Optional<Business> findByIdAndOwnerId(Long id, Long ownerId);
}
