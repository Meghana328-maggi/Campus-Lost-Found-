const mongoose = require('mongoose');

const smartAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    color: {
      type: String,
      default: '',
      trim: true,
    },
    campusZone: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found', 'both'],
      default: 'found',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    notificationCount: {
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

smartAlertSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('SmartAlert', smartAlertSchema);
