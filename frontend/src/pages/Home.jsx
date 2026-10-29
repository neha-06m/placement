import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck, ArrowRight, CheckCircle2, Server } from 'lucide-react';
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

  return (
    <div>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3rem 1rem 2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.825rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <span>Phase 1</span>
          <span>•</span>
          <span>Authentication & Role-Based Portals</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          Campus Placement Management System
        </h1>
        <p style={{ maxWidth: '650px', margin: '1rem auto 2rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Connect graduating students, hiring companies, and placement officers in a unified, verified campus ecosystem.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to={getDashboardPath()} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              <span>Enter Your Dashboard ({user?.role})</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                <span>Sign In to Account</span>
              </Link>
            </>
          )}
        </div>

        {/* Backend live connection status banner */}
        <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', padding: '0.4rem 0.9rem', borderRadius: '9999px', border: '1px solid var(--border-light)' }}>
          <Server size={14} />
          <span>Backend API:</span>
          {apiStatus.checking ? (
            <span style={{ color: 'var(--warning)' }}>Checking connection...</span>
          ) : apiStatus.ok ? (
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Connected & Healthy</span>
          ) : (
            <span style={{ color: 'var(--danger)' }}>Offline (Start server on port 5001)</span>
          )}
        </div>
      </section>

      {/* Role Portals Grid */}
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center' }}>
          Three Dedicated Portals in One Platform
        </h2>

        <div className="grid-cols-3">
          {/* Student Portal Card */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--role-student-bg)', color: 'var(--role-student)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <GraduationCap size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Students / Applicants
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Build an academic and skills profile, track campus drives, and manage your placement applications seamlessly.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Academic & CGPA records
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Verified resume submissions
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Real-time application tracker
              </li>
            </ul>
            <Link to="/register?role=student" className="btn btn-outline btn-block btn-sm">
              Register as Student
            </Link>
          </div>

          {/* Company Portal Card */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--role-company-bg)', color: 'var(--role-company)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Building2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Companies / Recruiters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Post verified job openings, define eligibility requirements, and filter top campus talent efficiently.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Admin verification badge
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Job postings & eligibility
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Candidate pipeline management
              </li>
            </ul>
            <Link to="/register?role=company" className="btn btn-outline btn-block btn-sm">
              Register as Company
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="card">
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--role-admin-bg)', color: 'var(--role-admin)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Placement Officers / Admin
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Oversee drive compliance, verify incoming hiring partners, and review job postings before publication.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Company credential verification
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Pre-publish job approval
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--success)" /> Drive analytics & user control
              </li>
            </ul>
            <Link to="/register?role=admin" className="btn btn-outline btn-block btn-sm">
              Register as Admin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
