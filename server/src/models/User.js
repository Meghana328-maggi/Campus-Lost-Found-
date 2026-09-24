const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    college: {
      type: String,
      trim: true,
      default: 'Campus University',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    year: {
      type: String,
      trim: true,
      default: '1st Year',
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    reputationScore: {
      type: Number,
      default: 10,
    },
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    itemsReportedCount: {
      type: Number,
      default: 0,
    },
    itemsRecoveredCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET || 'campus_lost_found_dev_jwt_secret_key_3847294829348923',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = mongoose.model('User', userSchema);
