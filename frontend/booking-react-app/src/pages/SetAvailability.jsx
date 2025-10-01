import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import './SetAvailability.css';

const SetAvailability = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    businessId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
  });

  // Fetch user's businesses
  const { data: businesses } = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: async () => {
      const response = await api.getMyBusinesses();
      return response.data;
    },
  });

  // Fetch availability slots
  const { data: availabilitySlots, isLoading } = useQuery({
    queryKey: ['myAvailabilitySlots'],
    queryFn: async () => {
      const response = await api.getMyAvailabilitySlots();
      return response.data;
    },
  });

  // Create availability slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (data) => {
      await api.createAvailabilitySlot(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAvailabilitySlots'] });
      setSuccess('Availability slot added successfully');
      setShowForm(false);
      setFormData({
        businessId: '',
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
      });
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to add availability slot');
      setTimeout(() => setError(''), 5000);
    },
  });

  // Delete availability slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId) => {
      await api.deleteAvailabilitySlot(slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAvailabilitySlots'] });
      setSuccess('Availability slot deleted successfully');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to delete availability slot');
      setTimeout(() => setError(''), 5000);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.businessId) {
      setError('Please select a business');
      setTimeout(() => setError(''), 5000);
      return;
    }

    createSlotMutation.mutate({
      businessId: parseInt(formData.businessId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
    });
  };

  const handleDelete = (slotId, businessName, dateRange, time) => {
    if (window.confirm(`Are you sure you want to delete ${businessName} availability for ${dateRange} (${time})?`)) {
      deleteSlotMutation.mutate(slotId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time) => {
    // time is in HH:mm format, convert to readable format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Sort slots by start date
  const sortedSlots = [...(availabilitySlots || [])].sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });

  if (isLoading) {
    return <div className="loading">Loading availability slots...</div>;
  }

  return (
    <div className="set-availability">
      <div className="page-header">
        <h1>Set Availability</h1>
        <p>Manage your weekly availability schedule</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Add Slot Button */}
      {!showForm && (
        <button 
          className="btn btn-primary add-slot-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Availability Slot
        </button>
      )}

      {/* Add Slot Form */}
      {showForm && (
        <div className="add-slot-form">
          <h2>Add New Availability Slot</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="businessId">Business *</label>
              <select
                id="businessId"
                name="businessId"
                value={formData.businessId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a business</option>
                {businesses?.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createSlotMutation.isLoading}
              >
                {createSlotMutation.isLoading ? 'Adding...' : 'Add Slot'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Availability Slots */}
      <div className="availability-schedule">
        <h2>Current Availability Schedule</h2>
        
        {availabilitySlots?.length === 0 ? (
          <div className="no-slots">
            <p>No availability slots set yet.</p>
            <p className="help-text">
              Add availability slots to let customers know when you're available for appointments.
            </p>
          </div>
        ) : (
          <div className="slots-container">
            {sortedSlots.map(slot => (
              <div key={slot.id} className="slot-card">
                <div className="slot-info">
                  <div className="slot-business">{slot.businessName}</div>
                  <div className="slot-dates">
                    {formatDate(slot.startDate)} - {formatDate(slot.endDate)}
                  </div>
                  <div className="slot-time">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(
                    slot.id,
                    slot.businessName,
                    `${formatDate(slot.startDate)} - ${formatDate(slot.endDate)}`,
                    `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
                  )}
                  disabled={deleteSlotMutation.isLoading}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {businesses?.length === 0 && (
        <div className="help-message">
          <p>⚠️ You need to create a business first before adding availability slots.</p>
          <a href="/business/my-businesses" className="help-link">
            Go to My Businesses →
          </a>
        </div>
      )}
    </div>
  );
};

export default SetAvailability;

