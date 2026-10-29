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
  ShieldAlert,
  Search,
  Filter,
  Users,
  Award,
  FileCheck2,
  MessageSquare
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

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'audit' | 'officer'

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
          text: `Company has been ${
            newStatus === 'verified' ? 'verified as an accredited campus hiring partner' : 'marked as rejected'
          }.`
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
  const rejectedCount = companies.filter((c) => c.verificationStatus === 'rejected').length;

  const filteredCompanies = companies.filter((comp) => {
    const matchesSearch =
      comp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.industry && comp.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comp.location && comp.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && comp.verificationStatus === 'pending') ||
      (statusFilter === 'verified' && comp.verificationStatus === 'verified') ||
      (statusFilter === 'rejected' && comp.verificationStatus === 'rejected');

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title">Placement Officer Command Hub</h1>
            <span className="badge badge-admin">Admin Authority</span>
          </div>
          <p className="page-subtitle">
            Welcome, <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong> ({admin.designation || 'Placement Officer'}). Oversee employer accreditation, drive approvals, and compliance.
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
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-admin-bg)', color: '#C084FC' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{verifiedCount}</div>
            <div className="stat-label">Verified Hiring Partners</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Verifications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-company-bg)', color: '#2DD4BF' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-value">{companies.length}</div>
            <div className="stat-label">Registered Employers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
            <FileCheck2 size={24} />
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Placement Cell Audit Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <span>Accreditation Queue ({pendingCount} Pending)</span>
        </button>
        <button
          className={`filter-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <span>Placement Compliance & Policy</span>
        </button>
        <button
          className={`filter-tab ${activeTab === 'officer' ? 'active' : ''}`}
          onClick={() => setActiveTab('officer')}
        >
          <span>Officer Authority Details</span>
        </button>
      </div>

      {/* TAB 1: ACCREDITATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Company Accreditation Queue</h2>
              <p className="card-subtitle">
                Review registered recruiters and authorize their corporate profiles for campus placement drives
              </p>
            </div>
            <span className="badge badge-admin">Authority Action Required</span>
          </div>

          {/* Search & Status Filters */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)'
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Search by company name, industry, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '170px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses ({companies.length})</option>
                <option value="pending">Pending Review ({pendingCount})</option>
                <option value="verified">Verified Only ({verifiedCount})</option>
                <option value="rejected">Rejected Only ({rejectedCount})</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Loader2 size={32} className="spin" style={{ color: 'var(--role-admin)', margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading company records from MongoDB...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Building2 size={24} />
              </div>
              <h3 className="empty-state-title">No Employer Records Found</h3>
              <p className="empty-state-desc">
                {companies.length === 0
                  ? 'No companies currently registered. When recruiters register, their profiles will appear here for review.'
                  : 'No employers matched your search or status filter. Try clearing filters.'}
              </p>
              {companies.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredCompanies.map((comp) => {
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
                      padding: '1.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Industry: <strong style={{ color: 'var(--text-main)' }}>{comp.industry || 'Not specified'}</strong> •{' '}
                          Location: <strong style={{ color: 'var(--text-main)' }}>{comp.location || 'Not specified'}</strong> •{' '}
                          Size: <strong style={{ color: 'var(--text-main)' }}>{comp.companySize || '51-200'}</strong>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        {comp.verificationStatus !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => handleVerificationAction(comp._id, 'verified')}
                            disabled={updatingId === comp._id}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'transparent', gap: '0.35rem' }}
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
                            style={{ gap: '0.35rem' }}
                          >
                            {updatingId === comp._id ? <Loader2 size={14} className="spin" /> : <X size={14} />}
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid-cols-2" style={{ fontSize: '0.875rem', marginBottom: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Official Corporate Email:</span>{' '}
                        <strong style={{ color: 'var(--text-main)' }}>{comp.officialEmail}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Recruiter Lead:</span>{' '}
                        <strong style={{ color: 'var(--text-main)' }}>
                          {comp.recruiterContact?.name || comp.user?.name || 'Recruiter'}
                        </strong>{' '}
                        <span style={{ color: 'var(--text-dim)' }}>
                          ({comp.recruiterContact?.designation || 'HR'} • {comp.recruiterContact?.email || 'Email on file'})
                        </span>
                      </div>
                    </div>

                    {comp.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontStyle: 'italic', backgroundColor: 'var(--bg-input)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                        "{comp.description}"
                      </p>
                    )}

                    {/* Admin remarks input */}
                    <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.65rem' }}>
                      <MessageSquare size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                        placeholder="Add optional verification remarks or feedback for this employer..."
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
      )}

      {/* TAB 2: AUDIT & COMPLIANCE */}
      {activeTab === 'audit' && (
        <div className="grid-cols-2">
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Campus Placement Policy</h2>
                <p className="card-subtitle">Standard compliance rules enforced across all campus drives</p>
              </div>
              <ShieldCheck size={20} style={{ color: '#C084FC' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                  1. One Student, One Dream Offer Policy
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  Students securing an offer above ₹12 LPA are deemed placed and cannot apply for lower CTC tier drives.
                </span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                  2. Mandatory PDF Resume Verification
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  All applicant resumes must be certified in PDF format under 2 MB with verified college credentials.
                </span>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                  3. Corporate Partner Accreditation
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  Recruiters must possess verified enterprise domain emails and institutional accreditation before publishing drives.
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Placement System Health</h2>
                <p className="card-subtitle">Database records and session integrity</p>
              </div>
              <CheckCircle2 size={20} style={{ color: 'var(--success-text)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Engine:</span>
                <strong style={{ color: 'var(--text-main)' }}>MongoDB (Memory Server / Embedded)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Authentication Protocol:</span>
                <strong style={{ color: 'var(--text-main)' }}>JWT (JSON Web Token) with RBAC Guard</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resume Upload Filter:</span>
                <strong style={{ color: 'var(--text-main)' }}>Multer PDF Filter (2 MB hard limit)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Backend Port:</span>
                <strong style={{ color: 'var(--text-main)' }}>Port 5001</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICER PROFILE */}
      {activeTab === 'officer' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Placement Cell Authority Profile</h2>
              <p className="card-subtitle">Administrative credentials and institution authorization</p>
            </div>
            <span className="badge badge-admin">Authorized Officer</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Officer Name:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{admin.designation || 'Placement Officer'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Faculty / Staff ID:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{admin.employeeId || 'TPO-8821'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Administrative Email:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
