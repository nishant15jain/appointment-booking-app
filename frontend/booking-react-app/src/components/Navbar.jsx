import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isCustomer, isBusiness } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isCustomer ? '/customer' : '/business'} className="navbar-logo">
          Appointment Booking
        </Link>

        <div className="navbar-menu">
          {isCustomer && (
            <>
              <Link to="/customer" className="navbar-link">Browse</Link>
              <Link to="/customer/appointments" className="navbar-link">My Appointments</Link>
            </>
          )}
          
          {isBusiness && (
            <>
              <Link to="/business" className="navbar-link">Dashboard</Link>
              <Link to="/business/appointments" className="navbar-link">Appointments</Link>
              <Link to="/business/my-businesses" className="navbar-link">My Businesses</Link>
              <Link to="/business/my-services" className="navbar-link">My Services</Link>
              <Link to="/business/availability" className="navbar-link">Availability</Link>
            </>
          )}

          <div className="navbar-user-section">
            <span className="navbar-user-info">
              {user?.role}
            </span>
            <button onClick={logout} className="navbar-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
