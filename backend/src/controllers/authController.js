const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new user (student, company, or admin)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      phone,
      studentDetails = {},
      companyDetails = {},
      adminDetails = {}
    } = req.body;

    // Validate role
    const allowedRoles = ['student', 'company', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role "${role}". Allowed roles are: ${allowedRoles.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Prepare role-specific payload
    const userData = {
      name: name?.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone?.trim() || ''
    };

    if (role === 'student') {
      userData.studentProfile = {
        rollNumber: studentDetails.rollNumber || '',
        department: studentDetails.department || '',
        batchYear: studentDetails.batchYear ? Number(studentDetails.batchYear) : null,
        cgpa: studentDetails.cgpa ? Number(studentDetails.cgpa) : null,
        skills: Array.isArray(studentDetails.skills) ? studentDetails.skills : [],
        resumeUrl: ''
      };
    } else if (role === 'company') {
      userData.companyProfile = {
        companyName: companyDetails.companyName || name?.trim() || '',
        website: companyDetails.website || '',
        industry: companyDetails.industry || '',
        location: companyDetails.location || '',
        description: companyDetails.description || '',
        isVerified: false // Requires admin verification in Phase 3
      };
    } else if (role === 'admin') {
      userData.adminProfile = {
        designation: adminDetails.designation || 'Placement Officer',
        employeeId: adminDetails.employeeId || ''
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  generateToken
};
