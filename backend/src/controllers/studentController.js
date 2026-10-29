const fs = require('fs');
const path = require('path');
const StudentProfile = require('../models/StudentProfile');

// Helper to sanitize skills array
const formatSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

// @desc    Get current student's profile (creates initial if none exists)
// @route   GET /api/students/profile/me
// @access  Private (Student)
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      // Auto-initialize profile using account registration details
      profile = await StudentProfile.create({
        user: req.user._id,
        fullName: req.user.name || '',
        email: req.user.email || '',
        phone: req.user.phone || '',
        branch: req.user.studentProfile?.department || '',
        graduationYear: req.user.studentProfile?.batchYear || null,
        cgpa: req.user.studentProfile?.cgpa || null,
        skills: req.user.studentProfile?.skills || []
      });
    }

    // Ensure completion is fresh
    profile.calculateCompletion();

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student's profile
// @route   PUT /api/students/profile/me
// @access  Private (Student)
const updateMyProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      collegeName,
      course,
      branch,
      graduationYear,
      cgpa,
      skills,
      linkedInUrl,
      gitHubUrl,
      projects
    } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new StudentProfile({
        user: req.user._id,
        fullName: req.user.name || 'Student',
        email: req.user.email || '',
        phone: req.user.phone || ''
      });
    }

    // Validation checks
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required' });
      }
      profile.fullName = fullName.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }
      profile.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) profile.phone = phone.trim();
    if (collegeName !== undefined) profile.collegeName = collegeName.trim();
    if (course !== undefined) profile.course = course.trim();
    if (branch !== undefined) profile.branch = branch.trim();

    if (graduationYear !== undefined && graduationYear !== null && graduationYear !== '') {
      const yr = Number(graduationYear);
      if (isNaN(yr) || yr < 2000 || yr > 2100) {
        return res.status(400).json({ success: false, message: 'Graduation year must be between 2000 and 2100' });
      }
      profile.graduationYear = yr;
    } else if (graduationYear === '') {
      profile.graduationYear = null;
    }

    if (cgpa !== undefined && cgpa !== null && cgpa !== '') {
      const gpa = Number(cgpa);
      if (isNaN(gpa) || gpa < 0 || gpa > 10) {
        return res.status(400).json({ success: false, message: 'CGPA must be a number between 0 and 10' });
      }
      profile.cgpa = gpa;
    } else if (cgpa === '') {
      profile.cgpa = null;
    }

    if (skills !== undefined) {
      profile.skills = formatSkills(skills);
    }

    if (linkedInUrl !== undefined) profile.linkedInUrl = linkedInUrl.trim();
    if (gitHubUrl !== undefined) profile.gitHubUrl = gitHubUrl.trim();

    if (projects !== undefined) {
      if (!Array.isArray(projects)) {
        return res.status(400).json({ success: false, message: 'Projects must be an array' });
      }

      for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        if (!p.title || !p.title.trim()) {
          return res.status(400).json({
            success: false,
            message: `Project #${i + 1} requires a title`
          });
        }
      }

      profile.projects = projects.map((p) => ({
        title: p.title.trim(),
        description: p.description?.trim() || '',
        techStack: formatSkills(p.techStack),
        projectUrl: p.projectUrl?.trim() || ''
      }));
    }

    profile.calculateCompletion();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload student resume (PDF only, max 2MB)
// @route   POST /api/students/profile/resume
// @access  Private (Student)
const uploadResumeHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a valid PDF file (max 2 MB).'
      });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new StudentProfile({
        user: req.user._id,
        fullName: req.user.name || 'Student',
        email: req.user.email || ''
      });
    }

    // Clean up old resume file if one was previously stored
    if (profile.resume?.filePath && fs.existsSync(profile.resume.filePath)) {
      try {
        fs.unlinkSync(profile.resume.filePath);
      } catch (err) {
        console.warn('Could not delete old resume file:', err.message);
      }
    }

    profile.resume = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    profile.calculateCompletion();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: profile.resume,
      profileCompletion: profile.profileCompletion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download or view student resume with access control
// @route   GET /api/students/profile/resume (or /api/students/:id/resume for recruiter/admin)
// @access  Private (Student itself, or Company/Admin)
const downloadResumeHandler = async (req, res, next) => {
  try {
    const studentUserId = req.params.studentId || req.user._id;

    // Authorization guard: students can only access their own resume
    if (req.user.role === 'student' && String(req.user._id) !== String(studentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only access your own resume'
      });
    }

    const profile = await StudentProfile.findOne({ user: studentUserId });

    if (!profile || !profile.resume || !profile.resume.filePath) {
      return res.status(404).json({
        success: false,
        message: 'No resume file found for this profile'
      });
    }

    if (!fs.existsSync(profile.resume.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file is not available on the server storage'
      });
    }

    // Set headers for secure inline or attachment delivery
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(profile.resume.originalName || 'resume.pdf')}"`
    );

    return res.sendFile(path.resolve(profile.resume.filePath));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResumeHandler,
  downloadResumeHandler
};
