import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await login({ email, password });
      const targetPath = from || getDashboardPath(data.user.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (role) => {
    if (role === 'student') {
      setEmail('student.demo@university.edu');
      setPassword('password123');
    } else if (role === 'company') {
      setEmail('recruiter.demo@techcorp.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin.demo@placemate.edu');
      setPassword('password123');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your PlaceMate portal account</p>
      </div>

      <div className="card">
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ marginTop: '1rem' }}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create one here
          </Link>
        </div>

        {/* Quick Demo Pre-fill helper */}
        <div className="demo-box">
          <div className="demo-title">Quick Demo Login Helpers</div>
          <div className="demo-btns">
            <button
              type="button"
              onClick={() => fillQuickDemo('student')}
              className="btn btn-outline btn-sm"
              title="Pre-fill student demo credentials"
            >
              <GraduationCap size={14} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('company')}
              className="btn btn-outline btn-sm"
              title="Pre-fill recruiter demo credentials"
            >
              <Building2 size={14} />
              <span>Company</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin')}
              className="btn btn-outline btn-sm"
              title="Pre-fill admin demo credentials"
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
