import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'student';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [batchYear, setBatchYear] = useState('2025');
  const [cgpa, setCgpa] = useState('');

  // Company specific
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [location, setLocation] = useState('');

  // Admin specific
  const [designation, setDesignation] = useState('Placement Officer');
  const [employeeId, setEmployeeId] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && ['student', 'company', 'admin'].includes(r)) {
      setRole(r);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      email,
      phone,
      password,
      role
    };

    if (role === 'student') {
      payload.studentDetails = {
        rollNumber,
        department,
        batchYear: batchYear ? Number(batchYear) : null,
        cgpa: cgpa ? Number(cgpa) : null
      };
    } else if (role === 'company') {
      payload.companyDetails = {
        companyName: companyName || name,
        website,
        industry,
        location
      };
    } else if (role === 'admin') {
      payload.adminDetails = {
        designation,
        employeeId
      };
    }

    try {
      const data = await register(payload);
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ maxWidth: '580px' }}>
      <div className="auth-header">
        <h1>Create Your Account</h1>
        <p>Join PlaceMate Campus Placement System</p>
      </div>

      <div className="card">
        {/* Role Selection Tabs */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            <GraduationCap size={16} />
            <span>Student</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
          >
            <Building2 size={16} />
            <span>Company</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            <ShieldCheck size={16} />
            <span>Admin</span>
          </button>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              {role === 'company' ? 'Recruiter Contact Name' : 'Full Name'}
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder={role === 'company' ? 'e.g. Jane Doe (HR Lead)' : 'e.g. Aarav Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder={role === 'student' ? 'student@university.edu' : 'recruiter@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                Academic Details
              </div>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="rollNumber">Roll / Registration No.</label>
                  <input
                    id="rollNumber"
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS2025-042"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="department">Department</label>
                  <select
                    id="department"
                    className="form-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Computer Science">Computer Science & Eng</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
              </div>
              <div className="grid-cols-2" style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="batchYear">Passing Out Batch</label>
                  <select
                    id="batchYear"
                    className="form-select"
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cgpa">Current CGPA (0 - 10)</label>
                  <input
                    id="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-input"
                    placeholder="e.g. 8.65"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Company Specific Fields */}
          {role === 'company' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--role-company)' }}>
                Company Organization Details
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Microsoft / Tata Consultancy Services"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="website">Official Website</label>
                  <input
                    id="website"
                    type="url"
                    className="form-input"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Headquarters / Location</label>
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bangalore / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Admin Specific Fields */}
          {role === 'admin' && (
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--role-admin)' }}>
                Placement Cell Credentials
              </div>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="designation">Designation</label>
                  <input
                    id="designation"
                    type="text"
                    className="form-input"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="employeeId">Faculty / Staff ID</label>
                  <input
                    id="employeeId"
                    type="text"
                    className="form-input"
                    placeholder="e.g. TPO-8821"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Fields */}
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password (min 6 chars)</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
            style={{ marginTop: '0.75rem' }}
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Registering...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
