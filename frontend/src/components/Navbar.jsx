import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, User, Building, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <GraduationCap size={14} />;
      case 'company':
        return <Building size={14} />;
      case 'admin':
        return <ShieldCheck size={14} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-link">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <span>PlaceMate</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="nav-link">
                Dashboard
              </Link>

              {user.role === 'student' && (
                <Link to="/student/profile" className="nav-link">
                  Profile & Resume
                </Link>
              )}

              {user.role === 'company' && (
                <Link to="/company/profile" className="nav-link">
                  Company Profile
                </Link>
              )}

              <div className="user-profile-badge">
                <span className={`badge badge-${user.role}`}>
                  {getRoleIcon(user.role)}
                  <span>{user.role}</span>
                </span>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Sign out of PlaceMate"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
