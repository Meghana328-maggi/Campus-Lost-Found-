const Bookmark = require('../models/Bookmark');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Toggle save/bookmark for an item
// @route   POST /api/bookmarks/toggle
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return sendError(res, 400, 'Item ID is required');
    }

    const existing = await Bookmark.findOne({ userId: req.user._id, itemId });

    if (existing) {
      await existing.deleteOne();
      return sendSuccess(res, 200, 'Item removed from saved items', { isBookmarked: false });
    } else {
      await Bookmark.create({ userId: req.user._id, itemId });
      return sendSuccess(res, 201, 'Item saved to bookmarks!', { isBookmarked: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookmarked items for current user
// @route   GET /api/bookmarks
// @access  Private
const getMyBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate({
        path: 'itemId',
        populate: { path: 'owner', select: 'name profileImage college' },
      })
      .sort({ createdAt: -1 });

    const items = bookmarks.map((b) => b.itemId).filter(Boolean);

    return sendSuccess(res, 200, 'Saved items retrieved', { items });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if item is bookmarked by current user
// @route   GET /api/bookmarks/check/:itemId
// @access  Private
const checkBookmarkStatus = async (req, res, next) => {
  try {
    const count = await Bookmark.countDocuments({
      userId: req.user._id,
      itemId: req.params.itemId,
    });
    return sendSuccess(res, 200, 'Bookmark status retrieved', { isBookmarked: count > 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleBookmark,
  getMyBookmarks,
  checkBookmarkStatus,
};
