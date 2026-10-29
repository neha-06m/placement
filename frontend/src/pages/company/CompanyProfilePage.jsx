import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCompanyProfile, updateCompanyProfile } from '../../api/profileApi';
import { Alert } from '../../components/Alert';

export const CompanyProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Company Form States
  const [companyName, setCompanyName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [companySize, setCompanySize] = useState('51-200');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Recruiter Contact States
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterDesignation, setRecruiterDesignation] = useState('');
  const [recruiterPhone, setRecruiterPhone] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');

  // Verification State from Backend
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [verifiedAt, setVerifiedAt] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await getCompanyProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setCompanyName(p.companyName || '');
        setOfficialEmail(p.officialEmail || '');
        setWebsite(p.website || '');
        setIndustry(p.industry || 'Technology & Software');
        setCompanySize(p.companySize || '51-200');
        setLocation(p.location || '');
        setDescription(p.description || '');

        const rc = p.recruiterContact || {};
        setRecruiterName(rc.name || '');
        setRecruiterDesignation(rc.designation || '');
        setRecruiterPhone(rc.phone || '');
        setRecruiterEmail(rc.email || '');

        setVerificationStatus(p.verificationStatus || 'pending');
        setAdminFeedback(p.adminFeedback || '');
        setVerifiedAt(p.verifiedAt || null);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to load company profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!companyName.trim()) {
      setMessage({ type: 'danger', text: 'Company name is required.' });
      return;
    }

    if (!officialEmail.trim()) {
      setMessage({ type: 'danger', text: 'Official corporate email is required.' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        companyName: companyName.trim(),
        officialEmail: officialEmail.trim(),
        website: website.trim(),
        industry: industry.trim(),
        companySize,
        location: location.trim(),
        description: description.trim(),
        recruiterContact: {
          name: recruiterName.trim(),
          designation: recruiterDesignation.trim(),
          phone: recruiterPhone.trim(),
          email: recruiterEmail.trim()
        }
      };

      const res = await updateCompanyProfile(payload);
      if (res.success && res.profile) {
        setMessage({ type: 'success', text: 'Company profile successfully saved to MongoDB!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to update company profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="spin" style={{ color: 'var(--role-company)', margin: '0 auto 1.25rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading company profile from database...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Company Profile & Accreditation</h1>
            <span className="badge badge-company">Employer Verification</span>
          </div>
          <p className="page-subtitle">
            Manage your organization identity, recruitment point of contact, and campus accreditation status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/dashboard/company" className="btn btn-outline" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: '150px', gap: '0.45rem' }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Verification Status Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          backgroundColor:
            verificationStatus === 'verified'
              ? 'var(--success-bg)'
              : verificationStatus === 'rejected'
              ? 'var(--danger-bg)'
              : 'var(--warning-bg)',
          borderColor:
            verificationStatus === 'verified'
              ? 'var(--success-border)'
              : verificationStatus === 'rejected'
              ? 'var(--danger-border)'
              : 'var(--warning-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {verificationStatus === 'verified' ? (
            <CheckCircle2 size={26} style={{ color: 'var(--success-text)', marginTop: '2px', flexShrink: 0 }} />
          ) : verificationStatus === 'rejected' ? (
            <ShieldAlert size={26} style={{ color: 'var(--danger-text)', marginTop: '2px', flexShrink: 0 }} />
          ) : (
            <Clock size={26} style={{ color: 'var(--warning-text)', marginTop: '2px', flexShrink: 0 }} />
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  color:
                    verificationStatus === 'verified'
                      ? 'var(--success-text)'
                      : verificationStatus === 'rejected'
                      ? 'var(--danger-text)'
                      : 'var(--warning-text)'
                }}
              >
                Verification Status: {verificationStatus}
              </span>
            </div>

            <p style={{ marginTop: '0.35rem', fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {verificationStatus === 'verified'
                ? `Accredited Campus Hiring Partner. Verified on ${new Date(verifiedAt || Date.now()).toLocaleDateString()}. Your company is authorized to publish campus recruitment drives.`
                : verificationStatus === 'rejected'
                ? 'Your company verification request was declined by the placement cell. Please review admin feedback below or update your credentials.'
                : 'Your profile is awaiting administrative review by the College Placement Officer. Once verified, your job postings will be published directly to graduating students.'}
            </p>

            {adminFeedback && (
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-light)'
                }}
              >
                <strong style={{ color: 'var(--text-main)' }}>Placement Cell Feedback:</strong>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{adminFeedback}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Company Organization Details */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Organization Overview</h2>
              <p className="card-subtitle">Public company details visible to campus applicants</p>
            </div>
            <Building2 size={20} style={{ color: 'var(--role-company)' }} />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="companyName">Company / Organization Name *</label>
              <input
                id="companyName"
                type="text"
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="officialEmail">Official Corporate Email *</label>
              <input
                id="officialEmail"
                type="email"
                className="form-input"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="website">Official Website URL</label>
              <input
                id="website"
                type="url"
                className="form-input"
                placeholder="https://techcorp.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="industry">Industry Sector</label>
              <select
                id="industry"
                className="form-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="Technology & Software">Technology & Software</option>
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Consulting & Strategy">Consulting & Strategy</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Automotive & Manufacturing">Automotive & Manufacturing</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="EdTech & Learning">EdTech & Learning</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="companySize">Company Size (Employees)</label>
              <select
                id="companySize"
                className="form-select"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              >
                <option value="1-10">1 - 10 employees (Startup / Seed)</option>
                <option value="11-50">11 - 50 employees (Early Growth)</option>
                <option value="51-200">51 - 200 employees (Mid-size)</option>
                <option value="201-500">201 - 500 employees (Scale-up)</option>
                <option value="501-1000">501 - 1000 employees</option>
                <option value="1000+">1000+ employees (Enterprise / MNC)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Headquarters / Location</label>
              <input
                id="location"
                type="text"
                className="form-input"
                placeholder="e.g. Bangalore, India / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" htmlFor="description">Company Description & Culture</label>
            <textarea
              id="description"
              rows={4}
              className="form-textarea"
              placeholder="Tell students about your company mission, technology stack, and engineering culture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Recruiter Contact Information */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Recruiter Contact Information</h2>
              <p className="card-subtitle">Placement officer point of contact for recruitment drives</p>
            </div>
            <Users size={20} style={{ color: 'var(--role-company)' }} />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="recruiterName">Lead Recruiter / HR Name</label>
              <input
                id="recruiterName"
                type="text"
                className="form-input"
                placeholder="e.g. Ananya Sen"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recruiterDesignation">Designation / Role</label>
              <input
                id="recruiterDesignation"
                type="text"
                className="form-input"
                placeholder="e.g. University Relations Lead"
                value={recruiterDesignation}
                onChange={(e) => setRecruiterDesignation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="recruiterPhone">Contact Phone Number</label>
              <input
                id="recruiterPhone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={recruiterPhone}
                onChange={(e) => setRecruiterPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recruiterEmail">Direct Contact Email</label>
              <input
                id="recruiterEmail"
                type="email"
                className="form-input"
                placeholder="ananya.recruiter@company.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
            style={{ minWidth: '180px', gap: '0.5rem' }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
