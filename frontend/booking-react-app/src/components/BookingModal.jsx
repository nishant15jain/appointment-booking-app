import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import './BookingModal.css';

const BookingModal = ({ business, service, onClose }) => {
  const [date, setDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch availability slots for the business
  const { data: availabilitySlots } = useQuery({
    queryKey: ['availabilitySlots', business.id],
    queryFn: async () => {
      const response = await api.getAvailabilityByBusinessId(business.id);
      return response.data;
    },
  });

  // Fetch existing appointments for the business
  const { data: existingAppointments } = useQuery({
    queryKey: ['businessAppointments', business.id],
    queryFn: async () => {
      const response = await api.getAppointmentsByBusinessId(business.id);
      return response.data;
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const response = await api.createAppointment(appointmentData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate appointments query to refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['businessAppointments', business.id] });
      onClose();
      navigate('/customer/appointments', {
        state: { message: 'Appointment booked successfully!' }
      });
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to book appointment');
    },
  });

  // Calculate available time slots when date changes
  useEffect(() => {
    if (!date || !availabilitySlots || !existingAppointments) {
      setAvailableSlots([]);
      setSelectedTimeSlot('');
      return;
    }

    const selectedDate = new Date(date + 'T00:00:00');

    // Get availability slots that include the selected date
    const validSlots = availabilitySlots.filter(slot => {
      const slotStart = new Date(slot.startDate + 'T00:00:00');
      const slotEnd = new Date(slot.endDate + 'T00:00:00');
      return selectedDate >= slotStart && selectedDate <= slotEnd;
    });

    if (validSlots.length === 0) {
      setAvailableSlots([]);
      setSelectedTimeSlot('');
      return;
    }

    // Generate all possible time slots
    const slots = [];
    validSlots.forEach(daySlot => {
      const [startHour, startMin] = daySlot.startTime.split(':').map(Number);
      const [endHour, endMin] = daySlot.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const serviceDuration = service.durationMinutes;

      // Generate slots in 30-minute intervals (or service duration if smaller)
      const interval = Math.min(30, serviceDuration);
      
      for (let time = startMinutes; time + serviceDuration <= endMinutes; time += interval) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Check if this time slot conflicts with existing appointments
        const slotDateTime = `${date}T${timeString}:00`;
        const hasConflict = existingAppointments.some(apt => {
          if (apt.status === 'CANCELLED') return false;
          
          const aptDateTime = new Date(apt.dateTime);
          const slotStart = new Date(slotDateTime);
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
          const aptEnd = new Date(aptDateTime.getTime() + apt.serviceDuration * 60000);
          
          // Check for overlap
          return (slotStart < aptEnd && slotEnd > aptDateTime);
        });

        if (!hasConflict) {
          slots.push(timeString);
        }
      }
    });

    setAvailableSlots(slots);
    setSelectedTimeSlot('');
  }, [date, availabilitySlots, existingAppointments, service.durationMinutes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!date || !selectedTimeSlot) {
      setError('Please select both date and time slot');
      return;
    }

    // Combine date and time into ISO format
    const dateTime = `${date}T${selectedTimeSlot}:00`;

    createAppointmentMutation.mutate({
      businessId: business.id,
      serviceId: service.id,
      dateTime: dateTime,
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Appointment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="booking-summary">
          <div className="summary-item">
            <span className="summary-label">Business:</span>
            <span className="summary-value">{business.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Service:</span>
            <span className="summary-value">{service.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Duration:</span>
            <span className="summary-value">{service.durationMinutes} minutes</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Price:</span>
            <span className="summary-value">${service.price}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {error && <div className="booking-error">{error}</div>}

          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              required
              className="form-input"
            />
          </div>

          {date && (
            <div className="form-group">
              <label>Select Available Time Slot</label>
              {availableSlots.length === 0 ? (
                <div className="no-slots-message">
                  No available time slots for this date. Please select another date or contact the business.
                </div>
              ) : (
                <div className="time-slots-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-btn ${selectedTimeSlot === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!availabilitySlots && (
            <div className="info-message">
              Loading available time slots...
            </div>
          )}

          {availabilitySlots && availabilitySlots.length === 0 && (
            <div className="warning-message">
              ⚠️ This business has not set up their availability schedule yet. Please contact them directly.
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              disabled={createAppointmentMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="confirm-btn"
              disabled={createAppointmentMutation.isPending || !selectedTimeSlot}
            >
              {createAppointmentMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
