import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  X,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAdminOverview } from '../../api/authApi';
import { getAllCompanies, verifyCompany } from '../../api/profileApi';
import { Alert } from '../../components/Alert';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, companiesRes] = await Promise.all([
        getAdminOverview().catch(() => null),
        getAllCompanies().catch(() => ({ companies: [] }))
      ]);

      if (overviewRes) setOverview(overviewRes);
      if (companiesRes && companiesRes.companies) {
        setCompanies(companiesRes.companies);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to load admin dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (companyId, newStatus) => {
    try {
      setUpdatingId(companyId);
      setMessage({ type: '', text: '' });
      const feedback = feedbackInput[companyId] || '';

      const res = await verifyCompany(companyId, newStatus, feedback);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Company has been ${newStatus === 'verified' ? 'verified as campus hiring partner' : 'marked as rejected'}.`
        });
        // Update local state
        setCompanies((prev) =>
          prev.map((c) =>
            c._id === companyId
              ? { ...c, verificationStatus: newStatus, adminFeedback: feedback }
              : c
          )
        );
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to update company verification status' });
    } finally {
      setUpdatingId(null);
    }
  };

  const admin = user?.adminProfile || {};
  const pendingCount = companies.filter((c) => c.verificationStatus === 'pending').length;
  const verifiedCount = companies.filter((c) => c.verificationStatus === 'verified').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Placement Officer Dashboard</h1>
            <span className="badge badge-admin">Admin Portal</span>
          </div>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong> ({admin.designation || 'Placement Officer'}). Oversee company verification and drive approvals.
          </p>
        </div>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Metrics Row */}
      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-admin-bg)', color: 'var(--role-admin)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{verifiedCount}</div>
            <div className="stat-label">Verified Hiring Partners</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Verifications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-value">{companies.length}</div>
            <div className="stat-label">Total Registered Employers</div>
          </div>
        </div>
      </div>

      {/* Company Verification Queue Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Company Accreditation Queue</h2>
            <p className="card-subtitle">
              Review registered recruiters and authorize their company profiles for campus placements
            </p>
          </div>
          <span className="badge badge-admin">Authority Action</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={24} className="spin" style={{ color: 'var(--role-admin)', margin: '0 auto 0.5rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading company records from MongoDB...</p>
          </div>
        ) : companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No companies currently registered. When recruiters sign up, their profiles will appear here for review.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {companies.map((comp) => {
              const isPending = comp.verificationStatus === 'pending';
              const isVer = comp.verificationStatus === 'verified';
              const isRej = comp.verificationStatus === 'rejected';

              return (
                <div
                  key={comp._id}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {comp.companyName}
                        </h3>
                        <span
                          className={`badge ${
                            isVer ? 'badge-success' : isRej ? 'badge-danger' : 'badge-warning'
                          }`}
                        >
                          {comp.verificationStatus}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Industry: <strong>{comp.industry || 'Not specified'}</strong> • Location: <strong>{comp.location || 'Not specified'}</strong> • Size: <strong>{comp.companySize || '51-200'}</strong>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {comp.verificationStatus !== 'verified' && (
                        <button
                          type="button"
                          onClick={() => handleVerificationAction(comp._id, 'verified')}
                          disabled={updatingId === comp._id}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: 'var(--success)' }}
                        >
                          {updatingId === comp._id ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                          <span>Approve & Verify</span>
                        </button>
                      )}

                      {comp.verificationStatus !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleVerificationAction(comp._id, 'rejected')}
                          disabled={updatingId === comp._id}
                          className="btn btn-danger btn-sm"
                        >
                          {updatingId === comp._id ? <Loader2 size={14} className="spin" /> : <X size={14} />}
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid-cols-2" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Official Email:</span>{' '}
                      <strong style={{ color: 'var(--text-main)' }}>{comp.officialEmail}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Recruiter Lead:</span>{' '}
                      <strong>{comp.recruiterContact?.name || comp.user?.name || 'Recruiter'}</strong> (
                      {comp.recruiterContact?.designation || 'HR'})
                    </div>
                  </div>

                  {comp.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                      "{comp.description}"
                    </p>
                  )}

                  {/* Admin feedback input */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.65rem' }}
                      placeholder="Optional remarks / verification feedback for this employer..."
                      value={feedbackInput[comp._id] !== undefined ? feedbackInput[comp._id] : comp.adminFeedback || ''}
                      onChange={(e) =>
                        setFeedbackInput({ ...feedbackInput, [comp._id]: e.target.value })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Authority Profile Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Placement Cell Authority</h2>
            <p className="card-subtitle">Officer administrative credentials</p>
          </div>
          <span className="badge badge-admin">Authorized</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Officer Name:</span>
            <span style={{ fontWeight: 600 }}>{user?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
            <span style={{ fontWeight: 600 }}>{admin.designation || 'Placement Officer'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Administrative Email:</span>
            <span style={{ fontWeight: 600 }}>{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
