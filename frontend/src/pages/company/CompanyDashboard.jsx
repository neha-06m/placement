import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  Users,
  ShieldAlert,
  CheckCircle2,
  Globe,
  MapPin,
  ExternalLink,
  Edit,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCompanyOverview } from '../../api/authApi';
import { getCompanyProfile } from '../../api/profileApi';
import { Alert } from '../../components/Alert';

export const CompanyDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getCompanyOverview().catch((err) => ({ error: err.message })),
      getCompanyProfile().catch((err) => ({ error: err.message }))
    ])
      .then(([overviewRes, profileRes]) => {
        if (overviewRes && !overviewRes.error) setOverview(overviewRes);
        if (profileRes && profileRes.success) setProfile(profileRes.profile);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch company overview');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const verificationStatus = profile?.verificationStatus || 'pending';
  const isVerified = verificationStatus === 'verified';
  const isRejected = verificationStatus === 'rejected';

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Company Portal</h1>
            <span className="badge badge-company">Recruiter Portal</span>
          </div>
          <p className="page-subtitle">
            Welcome, <strong>{profile?.recruiterContact?.name || user?.name}</strong> from{' '}
            <strong>{profile?.companyName || user?.companyProfile?.companyName || 'Your Organization'}</strong>.
          </p>
        </div>

        <Link to="/company/profile" className="btn btn-primary">
          <Edit size={16} />
          <span>Edit Company Profile</span>
        </Link>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Verification Status Banner */}
      {isVerified ? (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <CheckCircle2 size={24} color="var(--success)" />
            <div>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>
                Accredited Campus Hiring Partner (Verified)
              </div>
              <div style={{ color: '#14532d', fontSize: '0.85rem' }}>
                Your company profile has been approved by the Placement Cell. You are authorized to publish placement drives.
              </div>
            </div>
          </div>
          <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
            Verified
          </span>
        </div>
      ) : isRejected ? (
        <div
          style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldAlert size={24} color="var(--danger)" />
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem' }}>
                Verification Declined by Placement Cell
              </div>
              <div style={{ color: '#7f1d1d', fontSize: '0.85rem' }}>
                {profile?.adminFeedback || 'Please update your company profile credentials to request re-verification.'}
              </div>
            </div>
          </div>
          <Link to="/company/profile" className="btn btn-outline btn-sm" style={{ backgroundColor: '#ffffff' }}>
            Review Profile
          </Link>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Clock size={24} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                Pending Admin Verification
              </div>
              <div style={{ color: '#78350f', fontSize: '0.85rem' }}>
                The Placement Officer is reviewing your company credentials. Job posting will unlock upon accreditation.
              </div>
            </div>
          </div>
          <span className="badge badge-warning" style={{ textTransform: 'uppercase' }}>
            Pending Review
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-company-bg)', color: 'var(--role-company)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-value">0</div>
            <div className="stat-label">Active Job Openings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">0</div>
            <div className="stat-label">Total Applicants</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: isVerified ? 'var(--success-bg)' : isRejected ? 'var(--danger-bg)' : 'var(--warning-bg)',
              color: isVerified ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)'
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
              {verificationStatus}
            </div>
            <div className="stat-label">Verification Status</div>
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Company Profile Details */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Company Profile</h2>
              <p className="card-subtitle">Organization identity in placement records</p>
            </div>
            <span className={`badge ${isVerified ? 'badge-success' : isRejected ? 'badge-danger' : 'badge-warning'}`}>
              {verificationStatus}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Company Name:</span>
              <span style={{ fontWeight: 600 }}>{profile?.companyName || user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Industry:</span>
              <span style={{ fontWeight: 600 }}>{profile?.industry || 'Technology'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Company Size:</span>
              <span style={{ fontWeight: 600 }}>{profile?.companySize || '51-200'} employees</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <span style={{ fontWeight: 600 }}>{profile?.location || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Official Email:</span>
              <span style={{ fontWeight: 600 }}>{profile?.officialEmail || user?.email}</span>
            </div>
            {profile?.website && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Website:</span>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
                >
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <Link to="/company/profile" className="btn btn-outline btn-block btn-sm">
              <span>Edit Full Profile & Contacts</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Recruiter Contact Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recruiter Point of Contact</h2>
              <p className="card-subtitle">Placement officer coordination details</p>
            </div>
            <Users size={20} color="var(--role-company)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Recruiter Name:</span>
              <span style={{ fontWeight: 600 }}>{profile?.recruiterContact?.name || user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
              <span style={{ fontWeight: 600 }}>{profile?.recruiterContact?.designation || 'Talent Acquisition'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Direct Phone:</span>
              <span style={{ fontWeight: 600 }}>{profile?.recruiterContact?.phone || user?.phone || 'Not provided'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Direct Email:</span>
              <span style={{ fontWeight: 600 }}>{profile?.recruiterContact?.email || user?.email}</span>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                Next Phase: Job Creation & Eligibility
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Once verified by the Placement Cell, you will be able to post campus drives with minimum CGPA criteria.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
