package com.example.booking.availability;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AvailabilitySlotMapper {
    
    @Mapping(source = "business.id", target = "businessId")
    @Mapping(source = "business.name", target = "businessName")
    AvailabilitySlotDto toDto(AvailabilitySlot availabilitySlot);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "business", ignore = true)
    AvailabilitySlot toEntity(CreateAvailabilitySlotRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "business", ignore = true)
    void updateEntity(UpdateAvailabilitySlotRequest request, @MappingTarget AvailabilitySlot availabilitySlot);
}
