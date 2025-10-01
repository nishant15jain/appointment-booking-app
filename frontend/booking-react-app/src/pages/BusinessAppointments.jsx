import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import './BusinessAppointments.css';

const BusinessAppointments = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const queryClient = useQueryClient();

  // Fetch business appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['businessAppointments'],
    queryFn: async () => {
      const response = await api.getMyBusinessAppointments();
      return response.data;
    },
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }) => {
      await api.updateAppointmentStatus(appointmentId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessAppointments'] });
      setSuccess('Appointment status updated successfully');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to update appointment status');
      setTimeout(() => setError(''), 5000);
    },
  });

  const handleStatusUpdate = (appointmentId, status, appointmentInfo) => {
    const statusActions = {
      CONFIRMED: 'confirm',
      CANCELLED: 'cancel',
      COMPLETED: 'mark as done'
    };
    
    const action = statusActions[status];
    if (window.confirm(`Are you sure you want to ${action} this appointment with ${appointmentInfo}?`)) {
      updateStatusMutation.mutate({ appointmentId, status });
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      PENDING: 'status-badge pending',
      CONFIRMED: 'status-badge confirmed',
      CANCELLED: 'status-badge cancelled',
      COMPLETED: 'status-badge completed'
    };
    return statusClasses[status] || 'status-badge';
  };

  // Filter appointments based on selected status
  const filteredAppointments = appointments?.filter(apt => 
    filterStatus === 'ALL' || apt.status === filterStatus
  ) || [];

  if (isLoading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="business-appointments">
      <div className="page-header">
        <h1>Appointments Dashboard</h1>
        <p>Manage all your business appointments</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter tabs */}
      <div className="filter-tabs">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
            {status === 'ALL' 
              ? ` (${appointments?.length || 0})`
              : ` (${appointments?.filter(a => a.status === status).length || 0})`
            }
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <p>No {filterStatus.toLowerCase()} appointments found.</p>
          {appointments?.length === 0 && (
            <p className="help-text">
              Appointments will appear here when customers book your services.
            </p>
          )}
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-business">
                  <strong>{appointment.businessName}</strong>
                </div>
                <span className={getStatusBadgeClass(appointment.status)}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-body">
                <div className="appointment-info-row">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">
                    {appointment.customerName}
                  </span>
                </div>
                <div className="appointment-info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{appointment.customerEmail}</span>
                </div>
                <div className="appointment-info-row">
                  <span className="info-label">Service:</span>
                  <span className="info-value">
                    {appointment.serviceName} ({appointment.serviceDuration} min)
                  </span>
                </div>
                <div className="appointment-info-row">
                  <span className="info-label">Date & Time:</span>
                  <span className="info-value">
                    {formatDateTime(appointment.dateTime)}
                  </span>
                </div>
              </div>

              {/* Action buttons based on status */}
              <div className="appointment-actions">
                {appointment.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-confirm"
                      onClick={() => handleStatusUpdate(
                        appointment.id, 
                        'CONFIRMED',
                        `${appointment.customerName} for ${appointment.serviceName}`
                      )}
                      disabled={updateStatusMutation.isLoading}
                    >
                      ✓ Confirm
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => handleStatusUpdate(
                        appointment.id, 
                        'CANCELLED',
                        `${appointment.customerName} for ${appointment.serviceName}`
                      )}
                      disabled={updateStatusMutation.isLoading}
                    >
                      ✗ Cancel
                    </button>
                  </>
                )}
                {appointment.status === 'CONFIRMED' && (
                  <>
                    <button
                      className="btn btn-complete"
                      onClick={() => handleStatusUpdate(
                        appointment.id, 
                        'COMPLETED',
                        `${appointment.customerName} for ${appointment.serviceName}`
                      )}
                      disabled={updateStatusMutation.isLoading}
                    >
                      ✓ Mark Done
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => handleStatusUpdate(
                        appointment.id, 
                        'CANCELLED',
                        `${appointment.customerName} for ${appointment.serviceName}`
                      )}
                      disabled={updateStatusMutation.isLoading}
                    >
                      ✗ Cancel
                    </button>
                  </>
                )}
                {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                  <div className="appointment-final-status">
                    No actions available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessAppointments;

