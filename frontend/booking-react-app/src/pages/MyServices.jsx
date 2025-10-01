import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import './MyServices.css';

const MyServices = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    durationMinutes: '',
    price: '',
  });

  const queryClient = useQueryClient();

  // Fetch my businesses for dropdown
  const { data: businesses } = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: async () => {
      const response = await api.getMyBusinesses();
      return response.data;
    },
  });

  // Fetch my services
  const { data: services, isLoading } = useQuery({
    queryKey: ['myServices'],
    queryFn: async () => {
      const response = await api.getMyServices();
      return response.data;
    },
  });

  // Create service mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.createService(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      resetForm();
    },
  });

  // Update service mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.updateService(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
      resetForm();
    },
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServices'] });
    },
  });

  const resetForm = () => {
    setFormData({
      businessId: '',
      name: '',
      durationMinutes: '',
      price: '',
    });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      businessId: service.businessId,
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      businessId: parseInt(formData.businessId),
      name: formData.name,
      durationMinutes: parseInt(formData.durationMinutes),
      price: parseFloat(formData.price),
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Check if user has businesses first
  if (businesses && businesses.length === 0) {
    return (
      <div className="my-services-container">
        <h1>My Services</h1>
        <div className="no-data">
          <p>You need to create a business first before adding services.</p>
          <p>Go to "My Businesses" to create one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-services-container">
      <div className="header-section">
        <h1>My Services</h1>
        {!showForm && businesses && businesses.length > 0 && (
          <button onClick={() => setShowForm(true)} className="create-btn">
            + Add Service
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Business *</label>
              <select
                value={formData.businessId}
                onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                required
              >
                <option value="">Choose a business...</option>
                {businesses?.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Service Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Haircut, Consultation, etc."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  required
                  min="1"
                  placeholder="30"
                />
              </div>

              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingService ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {services && services.length === 0 ? (
        <div className="no-data">
          <p>You haven't created any services yet.</p>
          <p>Click "Add Service" to get started!</p>
        </div>
      ) : (
        <div className="services-list">
          {services?.map((service) => (
            <div key={service.id} className="service-item">
              <div className="service-info">
                <h3>{service.name}</h3>
                <p className="business-tag">🏢 {service.businessName}</p>
                <div className="service-meta">
                  <span className="duration">⏱️ {service.durationMinutes} min</span>
                  <span className="price">${service.price}</span>
                </div>
              </div>
              <div className="service-actions">
                <button onClick={() => handleEdit(service)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(service.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;
