import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Server,
  Briefcase,
  Users,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Check,
  FileCheck2,
  TrendingUp,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkHealth } from '../api/authApi';

export const Home = () => {
  const { isAuthenticated, user, getDashboardPath } = useAuth();
  const [apiStatus, setApiStatus] = useState({ checking: true, ok: false, message: '' });

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setApiStatus({ checking: false, ok: true, message: data.service });
      })
      .catch((err) => {
        setApiStatus({ checking: false, ok: false, message: err.message });
      });
  }, []);

  const featuredDrives = [
    {
      company: 'TechCorp Cloud Systems',
      role: 'Full Stack Software Engineer',
      type: 'Full-Time',
      location: 'Bangalore, India (Hybrid)',
      ctc: '₹14.0 - 20.0 LPA',
      deadline: 'Nov 15, 2026',
      minCgpa: '7.5 CGPA',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      applicants: 42
    },
    {
      company: 'FinEdge Global Capital',
      role: 'Financial Systems & Data Analyst',
      type: 'Full-Time',
      location: 'Mumbai, India (On-site)',
      ctc: '₹12.5 - 16.0 LPA',
      deadline: 'Nov 20, 2026',
      minCgpa: '7.0 CGPA',
      skills: ['Python', 'SQL', 'Financial Modeling', 'Tableau'],
      applicants: 28
    },
    {
      company: 'CyberShield Technologies',
      role: 'Cloud Security & DevOps Intern',
      type: '6-Month Internship',
      location: 'Hyderabad, India (Remote)',
      ctc: '₹55,000 / month Stipend',
      deadline: 'Nov 25, 2026',
      minCgpa: '8.0 CGPA',
      skills: ['Linux', 'Docker', 'Kubernetes', 'Cybersecurity'],
      applicants: 35
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 1rem 1.5rem', position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            backgroundColor: 'var(--primary-light)',
            color: '#818CF8',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            border: '1px solid var(--primary-border)'
          }}
        >
          <Sparkles size={14} color="#818CF8" />
          <span>Next-Gen Campus Placement Portal</span>
          <span>•</span>
          <span style={{ color: 'var(--text-muted)' }}>Verified & Compliant</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          Elevating Campus Placements with a Modern{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #818CF8, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Digital Ecosystem
          </span>
        </h1>

        <p
          style={{
            maxWidth: '680px',
            margin: '1.25rem auto 2.25rem',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            lineHeight: 1.6
          }}
        >
          Connect graduating students, accredited hiring companies, and university placement officers in a unified, verified campus recruitment network.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              className="btn btn-primary btn-lg"
              style={{ gap: '0.65rem' }}
            >
              <span>Enter Your Portal ({user?.role})</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn btn-primary btn-lg"
                style={{ gap: '0.65rem' }}
              >
                <span>Get Started as Student / Recruiter</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline btn-lg"
              >
                <span>Sign In to Account</span>
              </Link>
            </>
          )}
        </div>

        {/* Live Backend Connection Indicator */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.825rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-card)',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Server size={14} style={{ color: 'var(--primary)' }} />
            <span>Placement API Engine:</span>
            {apiStatus.checking ? (
              <span style={{ color: 'var(--warning-text)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="spin" style={{ display: 'inline-block' }}>●</span> Checking health...
              </span>
            ) : apiStatus.ok ? (
              <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                Connected & Ready
              </span>
            ) : (
              <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>
                Offline (Check port 5001)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section>
        <div className="grid-cols-4">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">98.4%</div>
              <div className="stat-label">Drive Success Rate</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--role-company-bg)', color: 'var(--role-company)' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div className="stat-value">150+</div>
              <div className="stat-label">Hiring Partners</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--role-admin-bg)', color: 'var(--role-admin)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">2,800+</div>
              <div className="stat-label">Verified Applicants</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="stat-value">₹14.2 LPA</div>
              <div className="stat-label">Average Package CTC</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campus Placement Drives */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
              Current Drive Opportunities
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Active Campus Placement Drives
            </h2>
          </div>
          <Link
            to={isAuthenticated ? getDashboardPath() : '/register'}
            className="btn btn-outline btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <span>Explore All Drives</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-cols-3">
          {featuredDrives.map((drive, idx) => (
            <div key={idx} className="job-card">
              <div className="job-header">
                <div>
                  <div className="job-company">
                    <Building2 size={14} />
                    <span>{drive.company}</span>
                  </div>
                  <h3 className="job-title">{drive.role}</h3>
                </div>
                <span className="badge badge-success">Active Drive</span>
              </div>

              <div className="job-meta-grid">
                <span className="job-meta-item">
                  <MapPin size={13} />
                  <span>{drive.location}</span>
                </span>
                <span className="job-meta-item">
                  <Briefcase size={13} />
                  <span>{drive.type}</span>
                </span>
                <span className="job-meta-item" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  💰 {drive.ctc}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span>Min Requirement: <strong style={{ color: 'var(--text-main)' }}>{drive.minCgpa}</strong></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} /> Deadline: {drive.deadline}
                </span>
              </div>

              <div className="job-tags">
                {drive.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="job-tag">
                    {skill}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <Link
                  to={isAuthenticated ? getDashboardPath() : `/register?role=student`}
                  className="btn btn-primary btn-block btn-sm"
                >
                  <span>Apply with Verified Resume</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Portals Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Three Dedicated Portals in One Unified Platform
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.4rem', maxWidth: '600px', margin: '0.4rem auto 0' }}>
            Tailored workflows for students, corporate recruiters, and college placement authorities.
          </p>
        </div>

        <div className="grid-cols-3">
          {/* Student Portal Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--role-student-bg)',
                color: 'var(--role-student)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--role-student-border)'
              }}
            >
              <GraduationCap size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Students & Applicants
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Build an academic and skill portfolio, upload verified PDF resumes, and track live applications to campus drives.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Academic CGPA records & batch tracking
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Secure 2 MB PDF resume uploads
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Real-time profile completion % meter
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Instant drive eligibility checking
              </li>
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <Link to="/register?role=student" className="btn btn-outline btn-block">
                <span>Register as Student</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Company Portal Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--role-company-bg)',
                color: 'var(--role-company)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--role-company-border)'
              }}
            >
              <Building2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Companies & Recruiters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Receive placement cell accreditation, configure campus hiring criteria, and discover top pre-screened talent.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Official verified hiring partner badge
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Target eligible departments and cutoff CGPA
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Access verified student PDF resumes
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Direct recruiter liaison with placement cell
              </li>
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <Link to="/register?role=company" className="btn btn-outline btn-block">
                <span>Register as Employer</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'var(--role-admin-bg)',
                color: 'var(--role-admin)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--role-admin-border)'
              }}
            >
              <ShieldCheck size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Placement Officers & Admin
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Maintain recruitment integrity, review employer credentials, approve drives, and analyze campus placement metrics.
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Real-time company accreditation queue
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> One-click employer approve / reject
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Centralized student records in MongoDB
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <CheckCircle2 size={16} color="var(--success-text)" /> Placement audit and batch compliance
              </li>
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <Link to="/register?role=admin" className="btn btn-outline btn-block">
                <span>Register as Admin</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Recruitment Process */}
      <section style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Streamlined Campus Placement Workflow
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Engineered for clarity, transparency, and high conversion at every recruitment phase.
          </p>
        </div>

        <div className="grid-cols-4">
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--primary-border)', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.1rem' }}>
              1
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Profile Setup & Resume
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5 }}>
              Students enter validated CGPA, technical skills, projects, and attach a certified PDF resume.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--role-company-border)', color: 'var(--role-company)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.1rem' }}>
              2
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Employer Verification
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5 }}>
              The Placement Cell verifies registered recruiters to ensure legitimate corporate opportunities.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--role-admin-border)', color: 'var(--role-admin)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.1rem' }}>
              3
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Drive Application & Filter
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5 }}>
              Recruiters configure cutoffs and job packages; eligible students submit applications in one click.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--success-border)', color: 'var(--success-text)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.1rem' }}>
              4
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Interviews & Placement
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.5 }}>
              Shortlists and offer confirmations are recorded in the central placement dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
