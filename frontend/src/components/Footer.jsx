import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, Sparkles, Server } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div className="brand-icon" style={{ padding: '0.35rem' }}>
                <GraduationCap size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>PlaceMate</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '340px' }}>
              Unified campus placement ecosystem connecting ambitious students, verified recruiters, and placement officers.
            </p>
            <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Portal Version 2.0 • Premium Dark</span>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Role Portals</div>
            <ul className="footer-links">
              <li>
                <Link to="/register?role=student" className="footer-link">Student Portal</Link>
              </li>
              <li>
                <Link to="/register?role=company" className="footer-link">Recruiter Portal</Link>
              </li>
              <li>
                <Link to="/register?role=admin" className="footer-link">Placement Cell</Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">Sign In to Dashboard</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Placement Services</div>
            <ul className="footer-links">
              <li>
                <span className="footer-link" style={{ cursor: 'default' }}>Verified Resumes</span>
              </li>
              <li>
                <span className="footer-link" style={{ cursor: 'default' }}>Campus Drives</span>
              </li>
              <li>
                <span className="footer-link" style={{ cursor: 'default' }}>CGPA Eligibility Check</span>
              </li>
              <li>
                <span className="footer-link" style={{ cursor: 'default' }}>Recruiter Accreditation</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Platform & Trust</div>
            <ul className="footer-links">
              <li>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'default' }}>
                  <ShieldCheck size={14} color="var(--success)" /> Verified Security
                </span>
              </li>
              <li>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'default' }}>
                  <Server size={14} color="var(--primary)" /> MongoDB Memory Server
                </span>
              </li>
              <li>
                <span className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'default' }}>
                  <Sparkles size={14} color="var(--accent-violet)" /> Dark Theme SaaS
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} PlaceMate. Campus Placement & Training Portal. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Campus Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
