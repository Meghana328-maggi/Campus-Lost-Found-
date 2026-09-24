const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ userId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
