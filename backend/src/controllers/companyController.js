const CompanyProfile = require('../models/CompanyProfile');
const User = require('../models/User');

// @desc    Get current recruiter's company profile (initializes if none exists)
// @route   GET /api/companies/profile/me
// @access  Private (Company)
const getMyCompanyProfile = async (req, res, next) => {
  try {
    let profile = await CompanyProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await CompanyProfile.create({
        user: req.user._id,
        companyName: req.user.companyProfile?.companyName || req.user.name || '',
        officialEmail: req.user.email || '',
        website: req.user.companyProfile?.website || '',
        industry: req.user.companyProfile?.industry || '',
        location: req.user.companyProfile?.location || '',
        description: req.user.companyProfile?.description || '',
        recruiterContact: {
          name: req.user.name || '',
          email: req.user.email || '',
          phone: req.user.phone || '',
          designation: 'Talent Acquisition'
        },
        verificationStatus: 'pending'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current recruiter's company profile
// @route   PUT /api/companies/profile/me
// @access  Private (Company)
const updateMyCompanyProfile = async (req, res, next) => {
  try {
    const {
      companyName,
      officialEmail,
      website,
      industry,
      description,
      companySize,
      location,
      recruiterContact
    } = req.body;

    let profile = await CompanyProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new CompanyProfile({
        user: req.user._id,
        companyName: req.user.companyProfile?.companyName || req.user.name || 'Company',
        officialEmail: req.user.email || '',
        recruiterContact: {
          name: req.user.name || '',
          email: req.user.email || '',
          phone: req.user.phone || ''
        }
      });
    }

    // Validation
    if (companyName !== undefined) {
      if (!companyName.trim()) {
        return res.status(400).json({ success: false, message: 'Company name is required' });
      }
      profile.companyName = companyName.trim();
    }

    if (officialEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!officialEmail || !emailRegex.test(officialEmail)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid official email address' });
      }
      profile.officialEmail = officialEmail.toLowerCase().trim();
    }

    if (website !== undefined) profile.website = website.trim();
    if (industry !== undefined) profile.industry = industry.trim();
    if (description !== undefined) profile.description = description.trim();
    if (companySize !== undefined) {
      const allowedSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
      if (allowedSizes.includes(companySize)) {
        profile.companySize = companySize;
      }
    }
    if (location !== undefined) profile.location = location.trim();

    if (recruiterContact && typeof recruiterContact === 'object') {
      profile.recruiterContact = {
        name: recruiterContact.name?.trim() || profile.recruiterContact?.name || '',
        designation: recruiterContact.designation?.trim() || profile.recruiterContact?.designation || '',
        phone: recruiterContact.phone?.trim() || profile.recruiterContact?.phone || '',
        email: recruiterContact.email?.toLowerCase().trim() || profile.recruiterContact?.email || ''
      };
    }

    // Notice: verificationStatus is explicitly NOT updated here!
    // Recruiters cannot self-verify their company account.

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company profile by ID
// @route   GET /api/companies/:id
// @access  Private (Any authenticated user)
const getCompanyById = async (req, res, next) => {
  try {
    const profile = await CompanyProfile.findById(req.params.id).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Verify or reject a company profile
// @route   PUT /api/companies/:id/verification
// @access  Private (Admin only)
const updateCompanyVerification = async (req, res, next) => {
  try {
    const { verificationStatus, adminFeedback } = req.body;

    const allowed = ['pending', 'verified', 'rejected'];
    if (!allowed.includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid verification status. Must be one of: ${allowed.join(', ')}`
      });
    }

    let profile = await CompanyProfile.findById(req.params.id);
    if (!profile) {
      // Check if param is user ID
      profile = await CompanyProfile.findOne({ user: req.params.id });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    profile.verificationStatus = verificationStatus;
    profile.verifiedBy = req.user._id;
    profile.verifiedAt = new Date();
    if (adminFeedback !== undefined) {
      profile.adminFeedback = adminFeedback.trim();
    }

    await profile.save();

    // Synchronize user document companyProfile.isVerified
    if (profile.user) {
      await User.findByIdAndUpdate(profile.user, {
        'companyProfile.isVerified': verificationStatus === 'verified'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Company status updated to "${verificationStatus}"`,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: List all company profiles for verification queue
// @route   GET /api/companies
// @access  Private (Admin only)
const getAllCompanies = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      filter.verificationStatus = status;
    }

    const companies = await CompanyProfile.find(filter)
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCompanyProfile,
  updateMyCompanyProfile,
  getCompanyById,
  updateCompanyVerification,
  getAllCompanies
};
