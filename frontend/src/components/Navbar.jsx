import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, LogOut, User, Building2, ShieldCheck, LayoutDashboard, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <GraduationCap size={13} />;
      case 'company':
        return <Building2 size={13} />;
      case 'admin':
        return <ShieldCheck size={13} />;
      default:
        return <User size={13} />;
    }
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-link">
          <div className="brand-icon">
            <GraduationCap size={20} />
          </div>
          <span>PlaceMate</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                className={`nav-link ${isCurrent(getDashboardPath()) ? 'active' : ''}`}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard</span>
              </Link>

              {user?.role === 'student' && (
                <Link
                  to="/student/profile"
                  className={`nav-link ${isCurrent('/student/profile') ? 'active' : ''}`}
                >
                  <UserCheck size={15} />
                  <span>Profile & Resume</span>
                </Link>
              )}

              {user?.role === 'company' && (
                <Link
                  to="/company/profile"
                  className={`nav-link ${isCurrent('/company/profile') ? 'active' : ''}`}
                >
                  <Briefcase size={15} />
                  <span>Company Profile</span>
                </Link>
              )}

              <div className="user-profile-badge">
                <span className={`badge badge-${user?.role || 'neutral'}`}>
                  {getRoleIcon(user?.role)}
                  <span>{user?.role}</span>
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                  {user?.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Sign out of PlaceMate"
                style={{ gap: '0.4rem' }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isCurrent('/login') ? 'active' : ''}`}
              >
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
