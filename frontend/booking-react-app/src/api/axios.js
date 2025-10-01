import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/users/register', userData),
  
  // Businesses
  getAllBusinesses: () => axiosInstance.get('/businesses'),
  getBusinessById: (id) => axiosInstance.get(`/businesses/${id}`),
  getMyBusinesses: () => axiosInstance.get('/businesses/my'),
  createBusiness: (data) => axiosInstance.post('/businesses', data),
  updateBusiness: (id, data) => axiosInstance.put(`/businesses/${id}`, data),
  deleteBusiness: (id) => axiosInstance.delete(`/businesses/${id}`),
  
  // Services
  getServicesByBusinessId: (businessId) => 
    axiosInstance.get(`/services/business/${businessId}`),
  getMyServices: () => axiosInstance.get('/services/my'),
  createService: (data) => axiosInstance.post('/services', data),
  updateService: (id, data) => axiosInstance.put(`/services/${id}`, data),
  deleteService: (id) => axiosInstance.delete(`/services/${id}`),
  
  // Appointments
  createAppointment: (data) => axiosInstance.post('/appointments', data),
  getMyAppointments: () => axiosInstance.get('/appointments/my'),
  getMyBusinessAppointments: () => axiosInstance.get('/appointments/my-business'),
  getAppointmentsByBusinessId: (businessId) => 
    axiosInstance.get(`/appointments/business/${businessId}`),
  updateAppointmentStatus: (id, status) => 
    axiosInstance.patch(`/appointments/${id}/status`, { status }),
  deleteAppointment: (id) => axiosInstance.delete(`/appointments/${id}`),
  
  // Availability
  getAvailabilityByBusinessId: (businessId) => 
    axiosInstance.get(`/availability-slots/business/${businessId}`),
  getMyAvailabilitySlots: () => axiosInstance.get('/availability-slots/my'),
  createAvailabilitySlot: (data) => axiosInstance.post('/availability-slots', data),
  deleteAvailabilitySlot: (id) => axiosInstance.delete(`/availability-slots/${id}`),
};

export default axiosInstance;
