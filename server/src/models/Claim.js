const mongoose = require('mongoose');
const { CLAIM_STATUSES } = require('../config/constants');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Please explain why you believe this item is yours'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    uniqueDetails: {
      type: String,
      default: '',
      maxlength: [1000, 'Unique details cannot exceed 1000 characters'],
    },
    verificationAnswers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    proofImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    status: {
      type: String,
      enum: Object.values(CLAIM_STATUSES),
      default: CLAIM_STATUSES.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    handoverMeeting: {
      location: { type: String, default: '' },
      time: { type: Date, default: null },
      notes: { type: String, default: '' },
      isConfirmed: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate active claims by same claimant on same item
claimSchema.index({ itemId: 1, claimantId: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
