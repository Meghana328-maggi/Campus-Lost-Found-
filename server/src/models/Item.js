const mongoose = require('mongoose');
const { ITEM_TYPES, ITEM_STATUSES } = require('../config/constants');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(ITEM_TYPES),
      required: [true, 'Item type must be either lost or found'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      index: true,
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    model: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: String,
      trim: true,
      default: '',
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
    },
    uniqueFeatures: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    dateLostOrFound: {
      type: Date,
      required: [true, 'Please specify the date lost or found'],
      index: true,
    },
    approximateTime: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please provide the specific location'],
      trim: true,
      index: true,
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    campusZone: {
      type: String,
      required: [true, 'Please select the campus zone'],
      index: true,
    },
    condition: {
      type: String,
      enum: ['brand_new', 'good', 'fair', 'worn', 'damaged', 'not_applicable'],
      default: 'good',
    },
    currentStorageLocation: {
      type: String,
      trim: true,
      default: '',
    },
    // Hidden verification questions for found items - poster sets these, claimant answers to verify ownership
    hiddenVerification: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUSES),
      default: ITEM_STATUSES.ACTIVE,
      index: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    isSuspicious: {
      type: Boolean,
      default: false,
      index: true,
    },
    recoveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recoveredAt: {
      type: Date,
      default: null,
    },
    recoveryFeedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound text index for search
itemSchema.index(
  {
    title: 'text',
    description: 'text',
    brand: 'text',
    model: 'text',
    location: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      brand: 4,
      model: 4,
      location: 3,
      description: 2,
    },
  }
);

module.exports = mongoose.model('Item', itemSchema);
