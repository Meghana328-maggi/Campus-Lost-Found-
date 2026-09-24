const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      unique: true,
      trim: true,
    },
    zone: {
      type: String,
      required: true,
      trim: true,
    },
    building: {
      type: String,
      default: '',
      trim: true,
    },
    floor: {
      type: String,
      default: '',
      trim: true,
    },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Location', locationSchema);
