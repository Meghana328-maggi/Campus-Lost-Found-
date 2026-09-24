const SmartAlert = require('../models/SmartAlert');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Create smart alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res, next) => {
  try {
    const { category, subcategory, color, campusZone, keywords, type } = req.body;

    if (!category && !campusZone && (!keywords || keywords.length === 0)) {
      return sendError(res, 400, 'Please specify at least a category, campus zone, or keywords for the alert.');
    }

    const alert = await SmartAlert.create({
      userId: req.user._id,
      category: category || '',
      subcategory: subcategory || '',
      color: color || '',
      campusZone: campusZone || '',
      keywords: Array.isArray(keywords) ? keywords : keywords ? [keywords] : [],
      type: type || 'found',
    });

    return sendSuccess(res, 201, 'Smart alert created! You will be notified when matching items are found.', {
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's smart alerts
// @route   GET /api/alerts
// @access  Private
const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await SmartAlert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Smart alerts retrieved', { alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete smart alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res, next) => {
  try {
    const alert = await SmartAlert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) {
      return sendError(res, 404, 'Alert not found.');
    }
    return sendSuccess(res, 200, 'Smart alert deleted.');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle smart alert active state
// @route   PUT /api/alerts/:id/toggle
// @access  Private
const toggleAlert = async (req, res, next) => {
  try {
    const alert = await SmartAlert.findOne({ _id: req.params.id, userId: req.user._id });
    if (!alert) {
      return sendError(res, 404, 'Alert not found.');
    }
    alert.isActive = !alert.isActive;
    await alert.save();
    return sendSuccess(res, 200, `Alert is now ${alert.isActive ? 'active' : 'paused'}`, { alert });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlert,
  getMyAlerts,
  deleteAlert,
  toggleAlert,
};
