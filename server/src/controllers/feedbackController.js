const Feedback = require('../models/Feedback');
const Item = require('../models/Item');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { awardPointsAndCheckBadges } = require('../services/reputationService');

// @desc    Submit recovery feedback & rating
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res, next) => {
  try {
    const { itemId, claimId, rating, comment, experienceTag } = req.body;

    if (!itemId || !rating || !comment) {
      return sendError(res, 400, 'Please provide item ID, rating (1-5), and written feedback.');
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return sendError(res, 404, 'Item not found.');
    }

    // Determine who is being reviewed
    const isOwner = item.owner.toString() === req.user._id.toString();
    const reviewedUserId = isOwner ? item.recoveredBy : item.owner;

    if (!reviewedUserId) {
      return sendError(res, 400, 'Cannot submit feedback before item recovery is completed.');
    }

    // Check duplicate feedback
    const existing = await Feedback.findOne({ itemId, reviewerId: req.user._id });
    if (existing) {
      return sendError(res, 400, 'You have already submitted feedback for this recovery.');
    }

    const feedback = await Feedback.create({
      itemId,
      claimId: claimId || null,
      reviewerId: req.user._id,
      reviewedUserId,
      rating: Number(rating),
      comment: comment.trim(),
      experienceTag: experienceTag || 'trustworthy_finder',
    });

    // Link feedback to item
    item.recoveryFeedback = feedback._id;
    await item.save();

    // Reward reviewed user with reputation bonus if 4 or 5 stars
    if (Number(rating) >= 4) {
      await awardPointsAndCheckBadges(reviewedUserId, 10, 'Received positive 5-star recovery feedback');
    }

    return sendSuccess(res, 201, 'Thank you! Your feedback has been recorded.', { feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for an item
// @route   GET /api/feedback/item/:itemId
// @access  Public
const getItemFeedback = async (req, res, next) => {
  try {
    const feedbackList = await Feedback.find({ itemId: req.params.itemId })
      .populate('reviewerId', 'name profileImage college')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Item feedback retrieved', { feedback: feedbackList });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getItemFeedback,
};
