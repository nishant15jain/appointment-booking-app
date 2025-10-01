import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import BookingModal from '../components/BookingModal';
import './BrowseBusinesses.css';

const BrowseBusinesses = () => {
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch all businesses
  const { data: businesses, isLoading: loadingBusinesses } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const response = await api.getAllBusinesses();
      return response.data;
    },
  });

  // Fetch services for selected business
  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ['services', selectedBusiness?.id],
    queryFn: async () => {
      const response = await api.getServicesByBusinessId(selectedBusiness.id);
      return response.data;
    },
    enabled: !!selectedBusiness,
  });

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    setSelectedService(null);
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
  };

  const handleBackToBusinesses = () => {
    setSelectedBusiness(null);
    setSelectedService(null);
  };

  if (loadingBusinesses) {
    return <div className="loading">Loading businesses...</div>;
  }

  return (
    <div className="browse-container">
      {!selectedBusiness ? (
        // Business List View
        <div>
          <h1>Browse Businesses</h1>
          <p className="subtitle">Select a business to view available services</p>
          
          {businesses && businesses.length === 0 ? (
            <p className="no-data">No businesses available.</p>
          ) : (
            <div className="business-grid">
              {businesses?.map((business) => (
                <div 
                  key={business.id} 
                  className="business-card"
                  onClick={() => handleBusinessClick(business)}
                >
                  <h3>{business.name}</h3>
                  <p className="business-location">📍 {business.location}</p>
                  <p className="business-description">{business.description}</p>
                  <button className="view-services-btn">View Services →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Services List View
        <div>
          <button onClick={handleBackToBusinesses} className="back-btn">
            ← Back to Businesses
          </button>
          
          <div className="business-header">
            <h1>{selectedBusiness.name}</h1>
            <p className="business-location">📍 {selectedBusiness.location}</p>
            <p className="business-description">{selectedBusiness.description}</p>
          </div>

          <h2>Available Services</h2>
          
          {loadingServices ? (
            <div className="loading">Loading services...</div>
          ) : services && services.length === 0 ? (
            <p className="no-data">No services available for this business.</p>
          ) : (
            <div className="services-grid">
              {services?.map((service) => (
                <div key={service.id} className="service-card">
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <span className="service-duration">⏱️ {service.durationMinutes} min</span>
                    <span className="service-price">${service.price}</span>
                  </div>
                  <button 
                    onClick={() => handleServiceClick(service)}
                    className="book-btn"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showBookingModal && (
        <BookingModal
          business={selectedBusiness}
          service={selectedService}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BrowseBusinesses;
