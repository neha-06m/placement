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
  ArrowRight,
  Plus,
  Send,
  Eye,
  Download,
  Calendar,
  X,
  Check,
  Search,
  Filter,
  FileText
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
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'candidates' | 'overview'

  // Create Drive Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDrive, setNewDrive] = useState({
    role: '',
    type: 'Full-Time',
    location: '',
    ctc: '',
    minCgpa: '7.0',
    deadline: '',
    description: '',
    skills: ''
  });

  // Recruiter Drives
  const [drives, setDrives] = useState([
    {
      id: 'drive-101',
      role: 'Full Stack Software Engineer',
      type: 'Full-Time',
      location: 'Bangalore / Hybrid',
      ctc: '₹14.0 - 20.0 LPA',
      minCgpa: 7.5,
      deadline: 'Nov 15, 2026',
      status: 'Active',
      applicantsCount: 42
    },
    {
      id: 'drive-102',
      role: 'Cloud DevOps Associate',
      type: 'Full-Time',
      location: 'Hyderabad / Remote',
      ctc: '₹12.0 - 15.0 LPA',
      minCgpa: 7.0,
      deadline: 'Nov 22, 2026',
      status: 'Active',
      applicantsCount: 29
    }
  ]);

  // Candidates / Applicants Pipeline
  const [candidates, setCandidates] = useState([
    {
      id: 'c-1',
      name: 'Aarav Sharma',
      roll: 'CS2025-042',
      branch: 'Computer Science',
      cgpa: 8.85,
      role: 'Full Stack Software Engineer',
      appliedAt: 'Oct 28, 2026',
      status: 'Shortlisted for Technical Round',
      statusColor: 'badge-success'
    },
    {
      id: 'c-2',
      name: 'Rohan Verma',
      roll: 'IT2025-018',
      branch: 'Information Technology',
      cgpa: 7.95,
      role: 'Full Stack Software Engineer',
      appliedAt: 'Oct 29, 2026',
      status: 'Resume Under Review',
      statusColor: 'badge-student'
    },
    {
      id: 'c-3',
      name: 'Priya Patel',
      roll: 'ECE2025-091',
      branch: 'Electronics & Comm',
      cgpa: 8.2,
      role: 'Cloud DevOps Associate',
      appliedAt: 'Oct 27, 2026',
      status: 'Assessment Cleared',
      statusColor: 'badge-company'
    }
  ]);

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

  const handleCreateDriveSubmit = (e) => {
    e.preventDefault();
    if (!newDrive.role || !newDrive.ctc) {
      setError('Please provide at least the job role and package CTC.');
      return;
    }

    const created = {
      id: `drive-${Date.now()}`,
      role: newDrive.role,
      type: newDrive.type,
      location: newDrive.location || 'Bangalore, India',
      ctc: newDrive.ctc,
      minCgpa: Number(newDrive.minCgpa) || 7.0,
      deadline: newDrive.deadline || 'Dec 01, 2026',
      status: 'Active',
      applicantsCount: 0
    };

    setDrives([created, ...drives]);
    setShowCreateModal(false);
    setSuccessMsg(`Campus recruitment drive for "${newDrive.role}" published successfully!`);
    setNewDrive({
      role: '',
      type: 'Full-Time',
      location: '',
      ctc: '',
      minCgpa: '7.0',
      deadline: '',
      description: '',
      skills: ''
    });
  };

  const totalApplicants = candidates.length + drives.reduce((sum, d) => sum + d.applicantsCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title">Recruiter Command Center</h1>
            <span className="badge badge-company">Employer Portal</span>
          </div>
          <p className="page-subtitle">
            Welcome, <strong style={{ color: 'var(--text-main)' }}>{profile?.recruiterContact?.name || user?.name}</strong> from{' '}
            <strong style={{ color: 'var(--text-main)' }}>{profile?.companyName || user?.companyProfile?.companyName || 'Your Organization'}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!isVerified) {
                setError('Your company profile is awaiting Placement Cell verification. Drive publishing will activate once accredited.');
              } else {
                setShowCreateModal(true);
              }
            }}
            style={{ gap: '0.45rem' }}
          >
            <Plus size={16} />
            <span>Post Campus Drive</span>
          </button>

          <Link to="/company/profile" className="btn btn-outline" style={{ gap: '0.45rem' }}>
            <Edit size={15} />
            <span>Company Profile</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Verification Status Banner */}
      {isVerified ? (
        <div
          style={{
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.35rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <CheckCircle2 size={26} style={{ color: 'var(--success-text)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--success-text)', fontSize: '0.975rem' }}>
                Accredited Campus Hiring Partner (Verified)
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Your corporate credentials have been approved by the College Placement Cell. You are fully authorized to publish recruitment drives.
              </div>
            </div>
          </div>
          <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>
            Verified Partner
          </span>
        </div>
      ) : isRejected ? (
        <div
          style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.35rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldAlert size={26} style={{ color: 'var(--danger-text)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--danger-text)', fontSize: '0.975rem' }}>
                Verification Declined by Placement Officer
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {profile?.adminFeedback || 'Please update your corporate credentials or contact the placement cell to request re-verification.'}
              </div>
            </div>
          </div>
          <Link to="/company/profile" className="btn btn-outline btn-sm">
            Review Credentials
          </Link>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.35rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Clock size={26} style={{ color: 'var(--warning-text)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--warning-text)', fontSize: '0.975rem' }}>
                Pending Campus Accreditation
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                The Placement Officer is reviewing your corporate details. Drive publishing to students will unlock as soon as your credentials are verified.
              </div>
            </div>
          </div>
          <span className="badge badge-warning" style={{ textTransform: 'uppercase' }}>
            Under Review
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-company-bg)', color: '#2DD4BF' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-value">{drives.length}</div>
            <div className="stat-label">Active Campus Drives</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: '#818CF8' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{totalApplicants}</div>
            <div className="stat-label">Total Student Applicants</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{candidates.filter((c) => c.status.includes('Shortlisted') || c.status.includes('Cleared')).length}</div>
            <div className="stat-label">Shortlisted Candidates</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              backgroundColor: isVerified ? 'var(--success-bg)' : isRejected ? 'var(--danger-bg)' : 'var(--warning-bg)',
              color: isVerified ? 'var(--success-text)' : isRejected ? 'var(--danger-text)' : 'var(--warning-text)'
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
              {verificationStatus}
            </div>
            <div className="stat-label">Accreditation Status</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeTab === 'drives' ? 'active' : ''}`}
          onClick={() => setActiveTab('drives')}
        >
          <span>Campus Drives ({drives.length})</span>
        </button>
        <button
          className={`filter-tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          <span>Applicant Pipeline ({candidates.length})</span>
        </button>
        <button
          className={`filter-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>Company & Recruiter Details</span>
        </button>
      </div>

      {/* TAB 1: CAMPUS DRIVES */}
      {activeTab === 'drives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Published Campus Recruitment Drives
            </h3>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (!isVerified) {
                  setError('Your profile must be approved by the Placement Cell before creating new drives.');
                } else {
                  setShowCreateModal(true);
                }
              }}
              style={{ gap: '0.4rem' }}
            >
              <Plus size={14} />
              <span>Create New Drive</span>
            </button>
          </div>

          <div className="grid-cols-2">
            {drives.map((d) => (
              <div key={d.id} className="job-card">
                <div className="job-header">
                  <div>
                    <span className="badge badge-company" style={{ marginBottom: '0.4rem' }}>
                      {d.type}
                    </span>
                    <h3 className="job-title">{d.role}</h3>
                  </div>
                  <span className="badge badge-success">
                    {d.status}
                  </span>
                </div>

                <div className="job-meta-grid">
                  <span className="job-meta-item">
                    <MapPin size={13} /> {d.location}
                  </span>
                  <span className="job-meta-item" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    💰 {d.ctc}
                  </span>
                  <span className="job-meta-item">
                    Cutoff: {d.minCgpa} CGPA
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    Applicants: <strong style={{ color: 'var(--text-main)' }}>{d.applicantsCount} students</strong>
                  </span>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> Deadline: {d.deadline}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('candidates')}
                    style={{ flex: 1, gap: '0.4rem' }}
                  >
                    <Users size={14} />
                    <span>View Candidates</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE PIPELINE */}
      {activeTab === 'candidates' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Applicant Screening & Review Pipeline</h2>
              <p className="card-subtitle">Review student profiles, academic CGPA, and verified resumes</p>
            </div>
            <span className="badge badge-company">{candidates.length} Applicants</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Applied Position</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand) => (
                  <tr key={cand.id}>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{cand.name}</strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{cand.roll}</td>
                    <td>{cand.branch}</td>
                    <td>
                      <strong style={{ color: cand.cgpa >= 8.0 ? 'var(--success-text)' : 'var(--text-main)' }}>
                        {cand.cgpa.toFixed(2)}
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{cand.role}</td>
                    <td>
                      <span className={`badge ${cand.statusColor || 'badge-student'}`}>
                        {cand.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSuccessMsg(`Downloading certified PDF resume for candidate ${cand.name}...`);
                          setTimeout(() => setSuccessMsg(''), 2500);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ gap: '0.35rem' }}
                        title="Download verified student resume"
                      >
                        <Download size={13} />
                        <span>Resume</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANY & RECRUITER OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid-cols-2">
          {/* Company Profile Details */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Organization Overview</h2>
                <p className="card-subtitle">Corporate profile in placement records</p>
              </div>
              <span className={`badge ${isVerified ? 'badge-success' : isRejected ? 'badge-danger' : 'badge-warning'}`}>
                {verificationStatus}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Company Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.companyName || user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Industry Sector:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.industry || 'Technology & Software'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Company Size:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.companySize || '51-200'} employees</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Headquarters / Location:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.location || 'Not specified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Official Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.officialEmail || user?.email}</span>
              </div>
              {profile?.website && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Website:</span>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#2DD4BF' }}
                  >
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
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
              <Users size={20} style={{ color: 'var(--role-company)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recruiter Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.recruiterContact?.name || user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.recruiterContact?.designation || 'Talent Acquisition'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Direct Phone:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.recruiterContact?.phone || user?.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Direct Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.recruiterContact?.email || user?.email}</span>
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Placement Cell Liaison
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The Placement Office coordinates interview schedules, campus labs, and candidate test credentials directly through this contact.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CAMPUS DRIVE */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Publish New Campus Drive</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDriveSubmit}>
              <div className="form-group">
                <label className="form-label">Job Title / Role *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Associate Software Engineer (Full Stack)"
                  value={newDrive.role}
                  onChange={(e) => setNewDrive({ ...newDrive, role: e.target.value })}
                  required
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    value={newDrive.type}
                    onChange={(e) => setNewDrive({ ...newDrive, type: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time Placement</option>
                    <option value="6-Month Internship">6-Month Internship</option>
                    <option value="Internship + FTE">Internship leading to FTE</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Package CTC / Stipend *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹12.0 - 16.0 LPA"
                    value={newDrive.ctc}
                    onChange={(e) => setNewDrive({ ...newDrive, ctc: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Minimum Cutoff CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="form-input"
                    placeholder="e.g. 7.5"
                    value={newDrive.minCgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, minCgpa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newDrive.deadline}
                    onChange={(e) => setNewDrive({ ...newDrive, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bangalore, India (Hybrid) / Remote"
                  value={newDrive.location}
                  onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Overview & Expectations</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="Responsibilities, required technical capabilities, and drive interview stages..."
                  value={newDrive.description}
                  onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '0.45rem' }}
                >
                  <Send size={15} />
                  <span>Publish to Students</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
