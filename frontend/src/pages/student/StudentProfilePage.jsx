import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  BookOpen,
  Award,
  Globe,
  Code2,
  FileText,
  Upload,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ArrowLeft,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile, uploadResume, downloadResume } from '../../api/profileApi';
import { Alert } from '../../components/Alert';

export const StudentProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [resume, setResume] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Load existing profile from MongoDB on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getStudentProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setFullName(p.fullName || '');
        setEmail(p.email || '');
        setPhone(p.phone || '');
        setCollegeName(p.collegeName || '');
        setCourse(p.course || 'B.Tech');
        setBranch(p.branch || 'Computer Science & Engineering');
        setGraduationYear(p.graduationYear ? String(p.graduationYear) : '2025');
        setCgpa(p.cgpa !== null && p.cgpa !== undefined ? String(p.cgpa) : '');
        setSkills(p.skills || []);
        setLinkedInUrl(p.linkedInUrl || '');
        setGitHubUrl(p.gitHubUrl || '');
        setProjects(p.projects || []);
        setResume(p.resume || null);
        setProfileCompletion(p.profileCompletion || 0);
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  // Add skill tag
  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Add & update projects
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        techStack: [],
        projectUrl: ''
      }
    ]);
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Save profile changes to MongoDB
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!fullName.trim()) {
      setMessage({ type: 'danger', text: 'Full name is required.' });
      return;
    }

    if (cgpa !== '' && (Number(cgpa) < 0 || Number(cgpa) > 10 || isNaN(Number(cgpa)))) {
      setMessage({ type: 'danger', text: 'CGPA must be a valid number between 0 and 10.' });
      return;
    }

    for (let i = 0; i < projects.length; i++) {
      if (!projects[i].title.trim()) {
        setMessage({ type: 'danger', text: `Project #${i + 1} must have a title.` });
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        collegeName: collegeName.trim(),
        course: course.trim(),
        branch: branch.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : null,
        cgpa: cgpa !== '' ? Number(cgpa) : null,
        skills,
        linkedInUrl: linkedInUrl.trim(),
        gitHubUrl: gitHubUrl.trim(),
        projects
      };

      const res = await updateStudentProfile(payload);
      if (res.success && res.profile) {
        setProfileCompletion(res.profile.profileCompletion);
        setMessage({ type: 'success', text: 'Profile updated and saved to MongoDB successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Resume upload handler
  const handleResumeFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ type: 'danger', text: 'Invalid file type: Only PDF (.pdf) documents are permitted.' });
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'danger', text: 'File size exceeds limit: PDF resume must be under 2 MB.' });
      e.target.value = '';
      return;
    }

    try {
      setUploadingResume(true);
      setMessage({ type: '', text: '' });
      const res = await uploadResume(file);
      if (res.success) {
        setResume(res.resume);
        setProfileCompletion(res.profileCompletion);
        setMessage({ type: 'success', text: 'Resume uploaded and verified successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to upload resume' });
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleDownloadResume = async () => {
    try {
      setDownloadingResume(true);
      await downloadResume();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to download resume.' });
    } finally {
      setDownloadingResume(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 1.25rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading student profile from database...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 className="page-title">Student Profile & Credentials</h1>
            <span className="badge badge-student">Applicant Verification</span>
          </div>
          <p className="page-subtitle">
            Manage your academic records, technical skillset, project portfolio, and verified PDF resume.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/dashboard/student" className="btn btn-outline" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </Link>
          <button
            onClick={handleSaveProfile}
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: '145px', gap: '0.45rem' }}
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

      {/* Completion Meter Card */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '4px solid var(--primary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Profile Readiness Score
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.65rem' }}>
              (Higher completion increases recruiter shortlisting by 3x)
            </span>
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.35rem',
              color: profileCompletion >= 80 ? 'var(--success-text)' : 'var(--primary)'
            }}
          >
            {profileCompletion}%
          </div>
        </div>

        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${profileCompletion}%`,
              height: '100%',
              backgroundColor: profileCompletion >= 80 ? 'var(--success)' : 'var(--primary)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSaveProfile}>
        {/* Personal & College Info */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Personal & Contact Info</h2>
              <p className="card-subtitle">Basic identity and official communication channels</p>
            </div>
            <User size={20} style={{ color: 'var(--primary)' }} />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">College Email Address *</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="collegeName">College / University Name</label>
              <input
                id="collegeName"
                type="text"
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Academic Records & Eligibility</h2>
              <p className="card-subtitle">Course degree, branch, passing year, and official CGPA</p>
            </div>
            <GraduationCap size={20} style={{ color: '#818CF8' }} />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="course">Degree / Course</label>
              <select
                id="course"
                className="form-select"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech / M.E.</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Sc">M.Sc</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="branch">Branch / Department</label>
              <input
                id="branch"
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="graduationYear">Graduation Year</label>
              <select
                id="graduationYear"
                className="form-select"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cgpa">Cumulative CGPA (0 - 10)</label>
              <input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                className="form-input"
                placeholder="e.g. 8.75"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />
              <span className="form-hint">Used for automatic company drive cutoff screening</span>
            </div>
          </div>
        </div>

        {/* Technical Skills & Social Handles */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Technical Skills & Public Handles</h2>
              <p className="card-subtitle">Showcase your technical capabilities and code repositories</p>
            </div>
            <Award size={20} style={{ color: 'var(--warning-text)' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Key Technical Skills</label>
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type skill (e.g. React, Node.js, Python, Docker) and press Add"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-outline"
                style={{ flexShrink: 0, gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Skill tags */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                minHeight: '40px',
                padding: '0.65rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
            >
              {skills.length === 0 ? (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No skills added yet. Add your core languages, frameworks, and tools.
                </span>
              ) : (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: 'var(--primary-light)',
                      color: '#818CF8',
                      border: '1px solid var(--primary-border)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.825rem',
                      fontWeight: 600
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.8
                      }}
                      title="Remove skill"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid-cols-2" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="linkedInUrl">
                <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                id="linkedInUrl"
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gitHubUrl">
                <Code2 size={14} style={{ color: 'var(--text-muted)' }} />
                <span>GitHub Profile URL</span>
              </label>
              <input
                id="gitHubUrl"
                type="url"
                className="form-input"
                placeholder="https://github.com/username"
                value={gitHubUrl}
                onChange={(e) => setGitHubUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Project Portfolio</h2>
              <p className="card-subtitle">Showcase software, hardware, or engineering projects</p>
            </div>
            <button
              type="button"
              onClick={handleAddProject}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={14} />
              <span>Add Project</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No projects listed. Click <strong style={{ color: 'var(--text-main)' }}>"Add Project"</strong> above to showcase your best engineering accomplishments.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      Project #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="btn btn-danger btn-sm"
                      title="Remove this project"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Project Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Distributed Task Scheduler"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project / Demo Link</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://github.com/..."
                        value={proj.projectUrl}
                        onChange={(e) => handleProjectChange(idx, 'projectUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description & Key Contributions</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder="Brief overview of problem solved, architecture, and technology stack used..."
                      value={proj.description}
                      onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resume Upload Card */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Verified Resume (PDF)</h2>
              <p className="card-subtitle">Official verified document submitted with campus drive applications</p>
            </div>
            <FileText size={20} style={{ color: 'var(--primary)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {resume?.filePath ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  padding: '1.1rem 1.35rem',
                  borderRadius: 'var(--radius-sm)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--success-text)' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--success-text)', fontSize: '0.95rem' }}>
                      {resume.originalName || 'student_resume.pdf'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Uploaded: {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : 'Active on Record'} •{' '}
                      {resume.fileSize ? `${Math.round(resume.fileSize / 1024)} KB` : 'Verified PDF'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="btn btn-outline btn-sm"
                  disabled={downloadingResume}
                >
                  <Download size={14} />
                  <span>{downloadingResume ? 'Downloading...' : 'Download Resume'}</span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  backgroundColor: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <AlertCircle size={22} style={{ color: 'var(--warning-text)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--warning-text)' }}>
                  No resume uploaded yet. Placement officers require a verified PDF resume before considering applications.
                </span>
              </div>
            )}

            {/* Upload form dropzone */}
            <div
              style={{
                border: '2px dashed var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <Upload size={30} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {uploadingResume ? 'Uploading and validating PDF...' : 'Upload or Replace Resume'}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
                Only standard PDF files (.pdf) are accepted. Maximum size: 2 MB limit.
              </p>

              <label className="btn btn-primary btn-sm" style={{ cursor: uploadingResume ? 'not-allowed' : 'pointer' }}>
                <Upload size={14} />
                <span>{uploadingResume ? 'Processing...' : 'Select PDF Resume'}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleResumeFileChange}
                  disabled={uploadingResume}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
            style={{ minWidth: '180px', gap: '0.5rem' }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
