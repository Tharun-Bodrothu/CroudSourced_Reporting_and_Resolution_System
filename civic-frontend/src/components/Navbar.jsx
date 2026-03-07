import './Navbar.css';

import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { getUserFromToken, isTokenValid } from '../services/auth';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = isTokenValid() ? getUserFromToken() : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏛️ CiviX
        </Link>
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/issues" className="nav-link">All Issues</Link>
              {user.role === 'user' && (
                <>
                  <Link to="/feed" className="nav-link">Feed</Link>
                  <Link to="/map" className="nav-link">Map</Link>
                  <Link to="/report" className="nav-link">Report Issue</Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin Panel</Link>
              )}
              {user.role === 'department_admin' && (
                <Link to="/department" className="nav-link">Department</Link>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;