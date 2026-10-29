const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'company', 'admin'],
        message: 'Role must be student, company, or admin'
      },
      default: 'student',
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    studentProfile: {
      rollNumber: { type: String, default: '' },
      department: { type: String, default: '' },
      batchYear: { type: Number, default: null },
      cgpa: { type: Number, min: 0, max: 10, default: null },
      skills: [{ type: String }],
      resumeUrl: { type: String, default: '' }
    },
    companyProfile: {
      companyName: { type: String, default: '' },
      website: { type: String, default: '' },
      industry: { type: String, default: '' },
      location: { type: String, default: '' },
      description: { type: String, default: '' },
      isVerified: { type: Boolean, default: false }
    },
    adminProfile: {
      designation: { type: String, default: 'Placement Officer' },
      employeeId: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe representation without sensitive password
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
