const Report = require('../models/Report');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { processUploadedFiles } = require('../utils/uploadService');
const { REPORT_REASONS } = require('../config/constants');

// @desc    Submit a fraud / safety report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { reportedUser, item, claim, reason, description } = req.body;

    if (!reason || !description) {
      return sendError(res, 400, 'Please provide a valid reason and description for the report.');
    }

    if (!REPORT_REASONS.includes(reason)) {
      return sendError(res, 400, 'Invalid report reason selected.');
    }

    let evidenceImages = [];
    if (req.files && req.files.length > 0) {
      evidenceImages = await processUploadedFiles(req.files, req);
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUser || null,
      item: item || null,
      claim: claim || null,
      reason,
      description: description.trim(),
      evidenceImages,
    });

    return sendSuccess(res, 201, 'Report submitted successfully. Campus moderators will review it promptly.', {
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports submitted by current user
// @route   GET /api/reports/my
// @access  Private
const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('item', 'title images type')
      .populate('reportedUser', 'name email profileImage')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Your reports retrieved', { reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getMyReports,
};
