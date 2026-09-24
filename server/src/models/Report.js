const mongoose = require('mongoose');
const { REPORT_STATUSES, REPORT_REASONS } = require('../config/constants');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
      index: true,
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
      index: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide details for this report'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    evidenceImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: Object.values(REPORT_STATUSES),
      default: REPORT_STATUSES.PENDING,
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
