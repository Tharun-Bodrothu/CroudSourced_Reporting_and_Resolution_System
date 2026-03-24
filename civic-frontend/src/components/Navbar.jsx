import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { getUserFromToken, isTokenValid } from '../services/auth';
import NotificationsBell from './NotificationsBell';

function Navbar() {
  const navigate = useNavigate();
  const user = isTokenValid() ? getUserFromToken() : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">🏛️ CiviX</Link>
        <div className="navbar-menu">
          {user ? (
            <>
              {/* ── Citizen ── */}
              {(user.role === 'user' || user.role === 'citizen') && (
                <>
                  <Link to="/dashboard"     className="nav-link">Dashboard</Link>
                  <Link to="/issues"        className="nav-link">All Issues</Link>
                  <Link to="/map"           className="nav-link">Map</Link>
                  <Link to="/report"        className="nav-link">Report Issue</Link>
                  <Link to="/my-complaints" className="nav-link">My Complaints</Link>
                </>
              )}

              {/* ── Admin — only 4 links, no duplicates ── */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin"                className="nav-link">Dashboard</Link>
                  <Link to="/admin/analytics"      className="nav-link">Analytics</Link>
                  <Link to="/admin/users"          className="nav-link">Users</Link>
                  <Link to="/admin/departments"    className="nav-link">Departments</Link>
                </>
              )}

              {/* ── Department admin — 2 links only ── */}
              {user.role === 'department_admin' && (
                <>
                  <Link to="/department"       className="nav-link">Dashboard</Link>
                  <Link to="/department/about" className="nav-link">About</Link>
                </>
              )}

              <NotificationsBell />
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;