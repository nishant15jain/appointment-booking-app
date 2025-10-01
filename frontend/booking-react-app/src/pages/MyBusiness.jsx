import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import './MyBusiness.css';

const MyBusiness = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  });

  const queryClient = useQueryClient();

  // Fetch my businesses
  const { data: businesses, isLoading } = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: async () => {
      const response = await api.getMyBusinesses();
      return response.data;
    },
  });

  // Create business mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.createBusiness(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
      resetForm();
    },
  });

  // Update business mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.updateBusiness(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
      resetForm();
    },
  });

  // Delete business mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.deleteBusiness(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBusinesses'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', location: '' });
    setEditingBusiness(null);
    setShowForm(false);
  };

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      description: business.description,
      location: business.location,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBusiness) {
      updateMutation.mutate({ id: editingBusiness.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-business-container">
      <div className="header-section">
        <h1>My Businesses</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="create-btn">
            + Create Business
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingBusiness ? 'Edit Business' : 'Create New Business'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter business name"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe your business"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="Enter business location"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingBusiness ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {businesses && businesses.length === 0 ? (
        <div className="no-data">
          <p>You haven't created any businesses yet.</p>
          <p>Click "Create Business" to get started!</p>
        </div>
      ) : (
        <div className="business-list">
          {businesses?.map((business) => (
            <div key={business.id} className="business-item">
              <div className="business-info">
                <h3>{business.name}</h3>
                <p className="location">📍 {business.location}</p>
                <p className="description">{business.description}</p>
              </div>
              <div className="business-actions">
                <button onClick={() => handleEdit(business)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(business.id)} className="delete-btn">
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

export default MyBusiness;
