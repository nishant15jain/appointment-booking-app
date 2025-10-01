import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BrowseBusinesses from './pages/BrowseBusinesses';
import MyAppointments from './pages/MyAppointments';
import BusinessHome from './pages/BusinessHome';
import MyBusiness from './pages/MyBusiness';
import MyServices from './pages/MyServices';
import BusinessAppointments from './pages/BusinessAppointments';
import SetAvailability from './pages/SetAvailability';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Layout wrapper component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      {isAuthenticated && <Navbar />}
      {children}
    </>
  );
};

// Home redirect component
const Home = () => {
  const { isAuthenticated, isCustomer, isBusiness } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isCustomer) {
    return <Navigate to="/customer" replace />;
  }

  if (isBusiness) {
    return <Navigate to="/business" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />

              {/* Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <BrowseBusinesses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/appointments"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <MyAppointments />
                  </ProtectedRoute>
                }
              />

              {/* Business Routes */}
              <Route
                path="/business"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <BusinessHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/my-businesses"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <MyBusiness />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/my-services"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <MyServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/appointments"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <BusinessAppointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/availability"
                element={
                  <ProtectedRoute allowedRoles={['BUSINESS']}>
                    <SetAvailability />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;