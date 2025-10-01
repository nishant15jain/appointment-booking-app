import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { api } from '../api/axios';
import './MyAppointments.css';

const MyAppointments = () => {
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const queryClient = useQueryClient();

  // Check for success message from booking
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    }
  }, [location]);

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.getMyAppointments();
      return response.data;
    },
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      await api.updateAppointmentStatus(appointmentId, 'CANCELLED');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSuccess('Appointment cancelled successfully');
      setTimeout(() => setSuccess(''), 5000);
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      await api.deleteAppointment(appointmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSuccess('Appointment deleted successfully');
      setTimeout(() => setSuccess(''), 5000);
    },
  });

  const handleCancel = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleDelete = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      CANCELLED: 'status-cancelled',
      DONE: 'status-done',
    };
    return statusClasses[status] || '';
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  if (isLoading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="appointments-container">
      <h1>My Appointments</h1>
      
      {success && (
        <div className="success-message">{success}</div>
      )}

      {appointments && appointments.length === 0 ? (
        <div className="no-appointments">
          <p>You don't have any appointments yet.</p>
          <p>Browse businesses to book your first appointment!</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments?.map((appointment) => {
            const { date, time } = formatDateTime(appointment.dateTime);
            return (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <h3>{appointment.businessName}</h3>
                  <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <span className="detail-label">Service:</span>
                    <span className="detail-value">{appointment.serviceName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{date}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{time}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{appointment.serviceDuration} minutes</span>
                  </div>
                </div>

                <div className="appointment-actions">
                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="cancel-btn"
                      disabled={cancelAppointmentMutation.isPending}
                    >
                      {cancelAppointmentMutation.isPending ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {(appointment.status === 'CANCELLED' || appointment.status === 'DONE') && (
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="delete-btn"
                      disabled={deleteAppointmentMutation.isPending}
                    >
                      {deleteAppointmentMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
