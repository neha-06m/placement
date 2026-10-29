const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  techStack: [{
    type: String,
    trim: true
  }],
  projectUrl: {
    type: String,
    trim: true,
    default: ''
  }
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    collegeName: {
      type: String,
      trim: true,
      default: ''
    },
    course: {
      type: String,
      trim: true,
      default: ''
    },
    branch: {
      type: String,
      trim: true,
      default: ''
    },
    graduationYear: {
      type: Number,
      min: [2000, 'Graduation year cannot be earlier than 2000'],
      max: [2100, 'Graduation year cannot exceed 2100'],
      default: null
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: null
    },
    skills: [{
      type: String,
      trim: true
    }],
    linkedInUrl: {
      type: String,
      trim: true,
      default: ''
    },
    gitHubUrl: {
      type: String,
      trim: true,
      default: ''
    },
    projects: [projectSchema],
    resume: {
      fileName: { type: String, default: '' },
      originalName: { type: String, default: '' },
      filePath: { type: String, default: '' },
      fileSize: { type: Number, default: 0 },
      mimeType: { type: String, default: '' },
      uploadedAt: { type: Date, default: null }
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

// Method to calculate completion percentage dynamically
studentProfileSchema.methods.calculateCompletion = function () {
  const criteria = [
    Boolean(this.fullName?.trim()),
    Boolean(this.email?.trim()),
    Boolean(this.phone?.trim()),
    Boolean(this.collegeName?.trim()),
    Boolean(this.course?.trim()),
    Boolean(this.branch?.trim()),
    Boolean(this.graduationYear),
    this.cgpa !== null && this.cgpa !== undefined && this.cgpa >= 0,
    Array.isArray(this.skills) && this.skills.length > 0,
    Boolean(this.linkedInUrl?.trim() || this.gitHubUrl?.trim()),
    Array.isArray(this.projects) && this.projects.length > 0,
    Boolean(this.resume?.filePath)
  ];

  const completed = criteria.filter(Boolean).length;
  this.profileCompletion = Math.round((completed / criteria.length) * 100);
  return this.profileCompletion;
};

// Pre-save hook to ensure profile completion is always up-to-date
studentProfileSchema.pre('save', function () {
  this.calculateCompletion();
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
