import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Edit,
  ArrowRight,
  Briefcase,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Send,
  Eye,
  Check,
  Building2,
  FileCheck2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentOverview } from '../../api/authApi';
import { getStudentProfile, downloadResume } from '../../api/profileApi';
import { Alert } from '../../components/Alert';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'records' | 'applications'

  // Job Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Sample Placement Drives Data tailored for students
  const [campusDrives, setCampusDrives] = useState([
    {
      id: 'job-1',
      company: 'TechCorp Cloud Systems',
      role: 'Full Stack Software Engineer',
      type: 'Full-Time',
      location: 'Bangalore, India (Hybrid)',
      ctc: '₹14.0 - 20.0 LPA',
      deadline: 'Nov 15, 2026',
      minCgpa: 7.5,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
      description:
        'Seeking talented core engineering graduates to build distributed microservices and scalable SaaS interfaces.',
      rounds: ['Online Assessment', 'Technical Coding Round', 'System Design Interview', 'HR Final']
    },
    {
      id: 'job-2',
      company: 'FinEdge Global Capital',
      role: 'Quantitative Software & Data Analyst',
      type: 'Full-Time',
      location: 'Mumbai, India (On-site)',
      ctc: '₹12.5 - 16.0 LPA',
      deadline: 'Nov 20, 2026',
      minCgpa: 7.0,
      skills: ['Python', 'SQL', 'PostgreSQL', 'Financial Modeling'],
      description:
        'Analyze transactional data streams and build automated real-time settlement monitoring tools.',
      rounds: ['Aptitude & Math Test', 'Python Programming', 'Technical Case Study', 'HR Discussion']
    },
    {
      id: 'job-3',
      company: 'CyberShield Technologies',
      role: 'Cloud Security & DevOps Intern',
      type: '6-Month Internship',
      location: 'Hyderabad, India (Remote)',
      ctc: '₹55,000 / month Stipend',
      deadline: 'Nov 25, 2026',
      minCgpa: 8.0,
      skills: ['Linux', 'Docker', 'Kubernetes', 'Cybersecurity', 'CI/CD'],
      description:
        'Hands-on internship in container security, vulnerability scanning, and automated deployment pipelines.',
      rounds: ['Cybersecurity Challenge', 'Technical DevOps Interview', 'HR Review']
    },
    {
      id: 'job-4',
      company: 'Nexus Mobility Innovations',
      role: 'Embedded Systems & IoT Engineer',
      type: 'Full-Time',
      location: 'Pune, India (On-site)',
      ctc: '₹10.0 - 13.5 LPA',
      deadline: 'Nov 30, 2026',
      minCgpa: 6.8,
      skills: ['C++', 'RTOS', 'Microcontrollers', 'IoT Protocols'],
      description:
        'Develop firmware solutions and connected vehicle telemetry systems for next-generation EV platforms.',
      rounds: ['Hardware & C++ Quiz', 'Embedded Firmware Lab', 'Managerial Interview']
    }
  ]);

  // Track applied jobs locally in state
  const [applications, setApplications] = useState([
    {
      jobId: 'job-2',
      company: 'FinEdge Global Capital',
      role: 'Quantitative Software & Data Analyst',
      appliedAt: 'Oct 26, 2026',
      status: 'Shortlisted for Technical Round',
      stageBadge: 'badge-success'
    }
  ]);

  useEffect(() => {
    Promise.all([
      getStudentOverview().catch((err) => ({ error: err.message })),
      getStudentProfile().catch((err) => ({ error: err.message }))
    ])
      .then(([overviewRes, profileRes]) => {
        if (overviewRes && !overviewRes.error) setOverview(overviewRes);
        if (profileRes && profileRes.success) setProfile(profileRes.profile);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDownload = async () => {
    try {
      setDownloadingResume(true);
      await downloadResume();
    } catch (err) {
      setError(err.message || 'Failed to download resume');
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleConfirmApply = () => {
    if (!applyModalJob) return;

    if (!profile?.resume?.filePath) {
      setError('Please upload your verified PDF resume in your profile before applying to campus drives.');
      setApplyModalJob(null);
      return;
    }

    const newApp = {
      jobId: applyModalJob.id,
      company: applyModalJob.company,
      role: applyModalJob.role,
      appliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Application Submitted (Under Review)',
      stageBadge: 'badge-student'
    };

    setApplications((prev) => [newApp, ...prev.filter((a) => a.jobId !== applyModalJob.id)]);
    setApplicationSuccess(true);
    setTimeout(() => {
      setApplicationSuccess(false);
      setApplyModalJob(null);
      setSuccessMsg(`Application for ${applyModalJob.role} at ${applyModalJob.company} submitted successfully!`);
    }, 1200);
  };

  const isApplied = (jobId) => applications.some((a) => a.jobId === jobId);

  const studentCgpa = profile?.cgpa ? Number(profile.cgpa) : null;
  const completion = profile?.profileCompletion || 0;

  // Filtered Drives
  const filteredDrives = campusDrives.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'all' ||
      (filterType === 'fulltime' && job.type.includes('Full-Time')) ||
      (filterType === 'internship' && job.type.includes('Internship')) ||
      (filterType === 'eligible' && (studentCgpa === null || studentCgpa >= job.minCgpa));

    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 className="page-title">Student Placement Portal</h1>
            <span className="badge badge-student">Active Applicant</span>
          </div>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--text-main)' }}>{profile?.fullName || user?.name}</strong>! Review verified records and upcoming campus drives.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/student/profile" className="btn btn-outline" style={{ gap: '0.45rem' }}>
            <FileText size={15} />
            <span>Manage Resume</span>
          </Link>
          <Link to="/student/profile" className="btn btn-primary" style={{ gap: '0.45rem' }}>
            <Edit size={15} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Profile Readiness & Completion Card */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          borderLeft: '4px solid var(--primary)',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Profile Completion Status: {completion}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
              {completion >= 80
                ? '🎉 Excellent readiness! Your profile and resume are fully visible to recruiters.'
                : 'Upload your verified resume and complete academic records to unlock one-click applications.'}
            </span>
          </div>
          <Link
            to="/student/profile"
            style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818CF8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>Update Profile Records</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${completion}%`,
              height: '100%',
              backgroundColor: completion >= 80 ? 'var(--success)' : 'var(--primary)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-student-bg)', color: '#818CF8' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-value">{profile?.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}</div>
            <div className="stat-label">Current CGPA</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{profile?.graduationYear || '2025'}</div>
            <div className="stat-label">Graduating Batch</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{profile?.projects?.length || 0}</div>
            <div className="stat-label">Projects Showcased</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-admin-bg)', color: '#C084FC' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-value">{campusDrives.length}</div>
            <div className="stat-label">Active Campus Drives</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeTab === 'drives' ? 'active' : ''}`}
          onClick={() => setActiveTab('drives')}
        >
          <span>Campus Placement Drives ({campusDrives.length})</span>
        </button>
        <button
          className={`filter-tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <span>Academic Records & Resume</span>
        </button>
        <button
          className={`filter-tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <span>My Applications ({applications.length})</span>
        </button>
      </div>

      {/* TAB 1: CAMPUS PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div>
          {/* Search & Filter Bar */}
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
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
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
                placeholder="Search by company name, role, or technical skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Filter size={15} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '180px' }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Drive Types</option>
                <option value="fulltime">Full-Time Only</option>
                <option value="internship">Internship Only</option>
                <option value="eligible">Eligible for My CGPA</option>
              </select>
            </div>
          </div>

          {filteredDrives.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={24} />
              </div>
              <h3 className="empty-state-title">No Matching Campus Drives</h3>
              <p className="empty-state-desc">
                No active drives match your current search criteria. Try clearing search filters.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid-cols-2">
              {filteredDrives.map((job) => {
                const applied = isApplied(job.id);
                const isEligible = studentCgpa === null || studentCgpa >= job.minCgpa;

                return (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <div>
                        <div className="job-company">
                          <Building2 size={14} />
                          <span>{job.company}</span>
                        </div>
                        <h3 className="job-title">{job.role}</h3>
                      </div>
                      {applied ? (
                        <span className="badge badge-student">
                          <Check size={12} /> Applied
                        </span>
                      ) : isEligible ? (
                        <span className="badge badge-success">
                          Eligible
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          Min CGPA: {job.minCgpa}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {job.description}
                    </p>

                    <div className="job-meta-grid">
                      <span className="job-meta-item">
                        <MapPin size={13} />
                        <span>{job.location}</span>
                      </span>
                      <span className="job-meta-item">
                        <Briefcase size={13} />
                        <span>{job.type}</span>
                      </span>
                      <span className="job-meta-item" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                        💰 {job.ctc}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span>
                        Cutoff: <strong style={{ color: isEligible ? 'var(--success-text)' : 'var(--warning-text)' }}>{job.minCgpa} CGPA</strong>
                        {studentCgpa && (
                          <span style={{ marginLeft: '0.4rem', color: 'var(--text-dim)' }}>
                            (Yours: {studentCgpa.toFixed(2)})
                          </span>
                        )}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> Deadline: {job.deadline}
                      </span>
                    </div>

                    <div className="job-tags">
                      {job.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="job-tag">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>

                      {applied ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled
                          style={{ flex: 1 }}
                        >
                          <Check size={14} />
                          <span>Submitted</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setApplyModalJob(job)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <Send size={14} />
                          <span>Apply Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACADEMIC RECORDS & RESUME */}
      {activeTab === 'records' && (
        <div className="grid-cols-2">
          {/* Academic Profile Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Academic Profile</h2>
                <p className="card-subtitle">Verified records stored in MongoDB</p>
              </div>
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Active Student
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.fullName || user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Degree & Branch:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {profile?.course || 'B.Tech'} - {profile?.branch || 'Computer Science'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>College / University:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.collegeName || 'National Institute of Technology'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary Email:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile?.email || user?.email}</span>
              </div>

              {/* Skills */}
              <div style={{ paddingTop: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                  Key Technical Skills:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((s, i) => (
                      <span key={i} className="badge badge-student" style={{ fontSize: '0.775rem' }}>
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No skills added yet.{' '}
                      <Link to="/student/profile" style={{ fontWeight: 600, color: '#818CF8' }}>Add skills</Link>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <Link to="/student/profile" className="btn btn-outline btn-block btn-sm">
                <span>Update Academic Profile</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Resume & Verification Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Placement Resume</h2>
                <p className="card-subtitle">Verified PDF document accessible to recruiters</p>
              </div>
              <FileText size={20} style={{ color: 'var(--primary)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {profile?.resume?.filePath ? (
                <div
                  style={{
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--success-text)' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--success-text)', fontSize: '0.925rem' }}>
                        {profile.resume.originalName || 'student_resume.pdf'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        {profile.resume.fileSize ? `${Math.round(profile.resume.fileSize / 1024)} KB` : 'PDF Document'} • Verified on File
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={downloadingResume}
                    className="btn btn-outline btn-sm"
                  >
                    <Download size={14} />
                    <span>{downloadingResume ? 'Downloading...' : 'Download'}</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--warning-bg)',
                    border: '1px solid var(--warning-border)',
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <AlertCircle size={20} style={{ color: 'var(--warning-text)', marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--warning-text)', fontSize: '0.925rem' }}>
                      Resume Not Uploaded
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      Please upload your PDF resume so hiring managers can verify your application for campus drives.
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  PDF format only (Max 2 MB limit)
                </span>
                <Link to="/student/profile" className="btn btn-outline btn-sm">
                  <span>Manage Resume & Projects</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Campus Drive Application Tracker</h2>
              <p className="card-subtitle">Real-time status of all your drive submissions</p>
            </div>
            <span className="badge badge-student">{applications.length} Submitted</span>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileCheck2 size={24} />
              </div>
              <h3 className="empty-state-title">No Applications Yet</h3>
              <p className="empty-state-desc">
                You haven't applied to any campus drives yet. Browse the "Campus Placement Drives" tab and submit your verified resume.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('drives')}
              >
                Browse Campus Drives
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Role & Position</th>
                    <th>Applied Date</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => (
                    <tr key={index}>
                      <td>
                        <strong style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={15} style={{ color: '#818CF8' }} />
                          {app.company}
                        </strong>
                      </td>
                      <td>{app.role}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.appliedAt}</td>
                      <td>
                        <span className={`badge ${app.stageBadge || 'badge-student'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            const foundJob = campusDrives.find((j) => j.id === app.jobId);
                            if (foundJob) setSelectedJob(foundJob);
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: JOB DETAILS */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} />
                  <span>{selectedJob.company}</span>
                </div>
                <h3 className="modal-title" style={{ marginTop: '0.2rem' }}>
                  {selectedJob.role}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedJob(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="job-meta-grid" style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span className="job-meta-item">
                  <MapPin size={14} /> {selectedJob.location}
                </span>
                <span className="job-meta-item">
                  <Briefcase size={14} /> {selectedJob.type}
                </span>
                <span className="job-meta-item" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  💰 {selectedJob.ctc}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Role Overview & Requirements
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {selectedJob.description}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Eligibility Criteria
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Minimum Cutoff: <strong style={{ color: 'var(--text-main)' }}>{selectedJob.minCgpa} CGPA</strong> across all registered semesters.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Selection Interview Rounds
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedJob.rounds.map((round, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: '#818CF8', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {rIdx + 1}
                      </span>
                      <span>{round}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </button>
                {!isApplied(selectedJob.id) && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedJob(null);
                      setApplyModalJob(selectedJob);
                    }}
                  >
                    <Send size={15} />
                    <span>Apply to Drive</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION CONFIRMATION */}
      {applyModalJob && (
        <div className="modal-overlay" onClick={() => setApplyModalJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Drive Application</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setApplyModalJob(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
                You are about to submit your application for{' '}
                <strong style={{ color: 'var(--text-main)' }}>{applyModalJob.role}</strong> at{' '}
                <strong style={{ color: 'var(--text-main)' }}>{applyModalJob.company}</strong>.
              </p>

              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Submitted Credentials:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{profile?.fullName || user?.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Roll Number:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{profile?.rollNumber || 'On Record'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Academic CGPA:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{studentCgpa ? studentCgpa.toFixed(2) : 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Resume Status:</span>
                    <strong style={{ color: profile?.resume?.filePath ? 'var(--success-text)' : 'var(--danger-text)' }}>
                      {profile?.resume?.filePath ? 'Attached (Verified PDF)' : 'Missing Resume'}
                    </strong>
                  </div>
                </div>
              </div>

              {!profile?.resume?.filePath && (
                <div style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: '0.85rem' }}>
                  Warning: You must upload a verified PDF resume before applying to campus recruitment drives.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setApplyModalJob(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmApply}
                  disabled={applicationSuccess || !profile?.resume?.filePath}
                >
                  {applicationSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Submitted!</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Confirm & Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
