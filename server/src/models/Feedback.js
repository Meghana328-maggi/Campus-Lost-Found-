const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please share your experience with this recovery'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    experienceTag: {
      type: String,
      enum: ['fast_and_easy', 'trustworthy_finder', 'good_communication', 'smooth_handover', 'other'],
      default: 'trustworthy_finder',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback from same reviewer on same item recovery
feedbackSchema.index({ itemId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
