import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isCustomer, isBusiness } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isCustomer ? '/customer' : '/business'} className="navbar-logo">
          Appointment Booking
        </Link>

        <button className="navbar-menu-toggle" onClick={toggleMenu}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {isCustomer && (
            <>
              <Link to="/customer" className="navbar-link" onClick={closeMenu}>Browse</Link>
              <Link to="/customer/appointments" className="navbar-link" onClick={closeMenu}>My Appointments</Link>
            </>
          )}
          
          {isBusiness && (
            <>
              <Link to="/business" className="navbar-link" onClick={closeMenu}>Dashboard</Link>
              <Link to="/business/appointments" className="navbar-link" onClick={closeMenu}>Appointments</Link>
              <Link to="/business/my-businesses" className="navbar-link" onClick={closeMenu}>My Businesses</Link>
              <Link to="/business/my-services" className="navbar-link" onClick={closeMenu}>My Services</Link>
              <Link to="/business/availability" className="navbar-link" onClick={closeMenu}>Availability</Link>
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
