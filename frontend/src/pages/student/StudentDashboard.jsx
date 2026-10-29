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
  ArrowRight
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

  const completion = profile?.profileCompletion || 0;

  return (
    <div>
      {/* Header with quick Edit Profile button */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Student Dashboard</h1>
            <span className="badge badge-student">Student Portal</span>
          </div>
          <p className="page-subtitle">
            Welcome back, <strong>{profile?.fullName || user?.name}</strong>! Track your placement readiness and applications.
          </p>
        </div>

        <Link to="/student/profile" className="btn btn-primary">
          <Edit size={16} />
          <span>Edit Profile & Resume</span>
        </Link>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Profile Completion Progress Card */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
          borderLeft: '4px solid var(--primary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              Profile Completion: {completion}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              {completion >= 80 ? '🎉 Excellent! Your profile is ready for recruiters.' : 'Complete academic details, projects, and resume to maximize selection chances.'}
            </span>
          </div>
          <Link to="/student/profile" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Update Details</span>
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
      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--role-student-bg)', color: 'var(--role-student)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-value">{profile?.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}</div>
            <div className="stat-label">Current CGPA</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{profile?.graduationYear || '2025'}</div>
            <div className="stat-label">Graduating Batch</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{profile?.projects?.length || 0}</div>
            <div className="stat-label">Projects Showcased</div>
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Academic Profile Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Academic Profile</h2>
              <p className="card-subtitle">Verified college records stored in MongoDB</p>
            </div>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Active Student
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
              <span style={{ fontWeight: 600 }}>{profile?.fullName || user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Degree & Branch:</span>
              <span style={{ fontWeight: 600 }}>{profile?.course || 'B.Tech'} - {profile?.branch || 'Computer Science'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>College / University:</span>
              <span style={{ fontWeight: 600 }}>{profile?.collegeName || 'National Institute of Technology'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Primary Email:</span>
              <span style={{ fontWeight: 600 }}>{profile?.email || user?.email}</span>
            </div>

            {/* Skills */}
            <div style={{ paddingTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>
                Key Technical Skills:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s, i) => (
                    <span key={i} className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No skills added yet.{' '}
                    <Link to="/student/profile" style={{ fontWeight: 600 }}>Add skills</Link>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resume & Verification Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Placement Resume</h2>
              <p className="card-subtitle">Verified PDF document for recruiters</p>
            </div>
            <FileText size={20} color="var(--primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profile?.resume?.filePath ? (
              <div
                style={{
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={22} color="var(--success)" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                      {profile.resume.originalName || 'student_resume.pdf'}
                    </div>
                    <div style={{ color: '#14532d', fontSize: '0.78rem' }}>
                      {profile.resume.fileSize ? `${Math.round(profile.resume.fileSize / 1024)} KB` : 'PDF Document'} • Active on File
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={downloadingResume}
                  className="btn btn-outline btn-sm"
                  style={{ backgroundColor: '#ffffff' }}
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
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}
              >
                <AlertCircle size={20} color="var(--warning)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
                    Resume Not Uploaded
                  </div>
                  <div style={{ color: '#78350f', fontSize: '0.825rem', marginTop: '0.2rem' }}>
                    Please upload your PDF resume so hiring managers can review your applications.
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                PDF format only (Max 2 MB)
              </span>
              <Link to="/student/profile" className="btn btn-outline btn-sm">
                <span>Manage Resume & Projects</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
