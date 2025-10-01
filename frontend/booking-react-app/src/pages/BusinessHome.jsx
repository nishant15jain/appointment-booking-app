import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import './BusinessHome.css';

const BusinessHome = () => {
  const navigate = useNavigate();

  // Fetch summary data
  const { data: businesses } = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: async () => {
      const response = await api.getMyBusinesses();
      return response.data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ['myServices'],
    queryFn: async () => {
      const response = await api.getMyServices();
      return response.data;
    },
  });

  return (
    <div className="business-home">
      <h1>Business Dashboard</h1>
      <p className="welcome-text">Welcome! Manage your businesses and services here.</p>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-number">{businesses?.length || 0}</div>
          <div className="stat-label">Businesses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{services?.length || 0}</div>
          <div className="stat-label">Services</div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card" onClick={() => navigate('/business/appointments')}>
            <div className="action-icon">📋</div>
            <h3>Appointments</h3>
            <p>View and manage appointments</p>
          </div>
          <div className="action-card" onClick={() => navigate('/business/my-businesses')}>
            <div className="action-icon">🏢</div>
            <h3>My Businesses</h3>
            <p>Create and manage your businesses</p>
          </div>
          <div className="action-card" onClick={() => navigate('/business/my-services')}>
            <div className="action-icon">💼</div>
            <h3>My Services</h3>
            <p>Add and manage your services</p>
          </div>
          <div className="action-card" onClick={() => navigate('/business/availability')}>
            <div className="action-icon">📅</div>
            <h3>Availability</h3>
            <p>Set your working hours</p>
          </div>
        </div>
      </div>

      {(!businesses || businesses.length === 0) && (
        <div className="getting-started">
          <h3>🚀 Getting Started</h3>
          <ol>
            <li>Create your business profile</li>
            <li>Add services you offer</li>
            <li>Set your availability</li>
            <li>Start receiving appointments!</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default BusinessHome;
