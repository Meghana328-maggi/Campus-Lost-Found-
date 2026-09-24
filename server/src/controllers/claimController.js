const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { processUploadedFiles } = require('../utils/uploadService');
const { sendClaimNotificationEmail, sendClaimStatusEmail } = require('../services/emailService');
const { awardPointsAndCheckBadges } = require('../services/reputationService');
const { CLAIM_STATUSES, ITEM_STATUSES, NOTIFICATION_TYPES, ROLES } = require('../config/constants');

// @desc    Submit an ownership claim for an item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const { itemId, reason, uniqueDetails, verificationAnswers } = req.body;

    if (!itemId || !reason) {
      return sendError(res, 400, 'Please provide an item ID and reason for claiming.');
    }

    const item = await Item.findById(itemId).populate('owner');
    if (!item) {
      return sendError(res, 404, 'Item not found.');
    }

    // Business rule 1: A user cannot claim their own item
    if (item.owner._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot claim an item that you reported.');
    }

    // Business rule 6: A recovered or closed item cannot receive new claims
    if ([ITEM_STATUSES.RECOVERED, ITEM_STATUSES.CLOSED, ITEM_STATUSES.CLAIMED].includes(item.status)) {
      return sendError(res, 400, 'This item is no longer available for claims.');
    }

    // Check if user already submitted a pending claim for this item
    const existingClaim = await Claim.findOne({
      itemId,
      claimantId: req.user._id,
      status: CLAIM_STATUSES.PENDING,
    });
    if (existingClaim) {
      return sendError(res, 400, 'You already have a pending claim submitted for this item.');
    }

    // Upload proof images
    let proofImages = [];
    if (req.files && req.files.length > 0) {
      proofImages = await processUploadedFiles(req.files, req);
    }

    // Parse verification answers
    let parsedAnswers = [];
    if (verificationAnswers) {
      try {
        parsedAnswers =
          typeof verificationAnswers === 'string' ? JSON.parse(verificationAnswers) : verificationAnswers;
      } catch (e) {
        parsedAnswers = [];
      }
    }

    const claim = await Claim.create({
      itemId: item._id,
      claimantId: req.user._id,
      ownerId: item.owner._id,
      reason: reason.trim(),
      uniqueDetails: uniqueDetails ? uniqueDetails.trim() : '',
      verificationAnswers: parsedAnswers,
      proofImages,
      status: CLAIM_STATUSES.PENDING,
    });

    // Update item status to claim_pending if active
    if (item.status === ITEM_STATUSES.ACTIVE) {
      item.status = ITEM_STATUSES.CLAIM_PENDING;
      await item.save();
    }

    // Notify item owner
    const notification = await Notification.create({
      userId: item.owner._id,
      type: NOTIFICATION_TYPES.CLAIM_RECEIVED,
      title: 'New Ownership Claim Submitted',
      message: `${req.user.name} submitted a claim for "${item.title}". Review their verification answers!`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      link: `/claims`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(item.owner._id.toString()).emit('new_notification', notification);
    }

    // Send email
    sendClaimNotificationEmail({
      owner: item.owner,
      item,
      claimant: req.user,
    }).catch((err) => console.error(err));

    return sendSuccess(res, 201, 'Claim submitted successfully. The finder/owner has been notified.', { claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims submitted by current user
// @route   GET /api/claims/my
// @access  Private
const getMySubmittedClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id })
      .populate('itemId', 'title type category campusZone images status')
      .populate('ownerId', 'name profileImage college')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Your submitted claims retrieved', { claims });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims received for items posted by current user
// @route   GET /api/claims/received
// @access  Private
const getReceivedClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ ownerId: req.user._id })
      .populate('itemId', 'title type category campusZone images status hiddenVerification')
      .populate('claimantId', 'name email phone profileImage college department reputationScore badges')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Received claims retrieved', { claims });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claim details by ID
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId', 'name email phone profileImage college department reputationScore badges')
      .populate('ownerId', 'name email phone profileImage college department');

    if (!claim) {
      return sendError(res, 404, 'Claim not found.');
    }

    const isClaimant = claim.claimantId._id.toString() === req.user._id.toString();
    const isOwner = claim.ownerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isClaimant && !isOwner && !isAdmin) {
      return sendError(res, 403, 'Unauthorized to view this claim.');
    }

    return sendSuccess(res, 200, 'Claim retrieved successfully', { claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve claim
// @route   PUT /api/claims/:id/approve
// @access  Private (Owner or Admin)
const approveClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId')
      .populate('ownerId');

    if (!claim) {
      return sendError(res, 404, 'Claim not found.');
    }

    const isOwner = claim.ownerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Only the item finder/owner or admin can approve this claim.');
    }

    if (claim.status !== CLAIM_STATUSES.PENDING) {
      return sendError(res, 400, `Claim is already ${claim.status}.`);
    }

    claim.status = CLAIM_STATUSES.APPROVED;
    if (req.body.adminNotes && isAdmin) {
      claim.adminNotes = req.body.adminNotes;
    }
    await claim.save();

    // Update item status
    const item = await Item.findById(claim.itemId._id);
    if (item) {
      item.status = ITEM_STATUSES.CLAIMED;
      await item.save();
    }

    // Award reputation points for verified ownership claim
    await awardPointsAndCheckBadges(claim.claimantId._id, 15, 'Ownership claim verified & approved');

    // Reject other pending claims for this item automatically
    await Claim.updateMany(
      {
        itemId: claim.itemId._id,
        _id: { $ne: claim._id },
        status: CLAIM_STATUSES.PENDING,
      },
      {
        status: CLAIM_STATUSES.REJECTED,
        rejectionReason: 'Another legitimate claim was approved for this item.',
      }
    );

    // Notify claimant
    const notification = await Notification.create({
      userId: claim.claimantId._id,
      type: NOTIFICATION_TYPES.CLAIM_APPROVED,
      title: 'Claim Approved!',
      message: `Your claim for "${claim.itemId.title}" was approved by ${req.user.name}. You can now message them to coordinate handover!`,
      relatedItem: claim.itemId._id,
      relatedClaim: claim._id,
      link: `/claims`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(claim.claimantId._id.toString()).emit('new_notification', notification);
    }

    // Send email to claimant
    sendClaimStatusEmail({
      claimant: claim.claimantId,
      item: claim.itemId,
      status: 'approved',
    }).catch((err) => console.error(err));

    return sendSuccess(res, 200, 'Claim approved successfully!', { claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject claim
// @route   PUT /api/claims/:id/reject
// @access  Private (Owner or Admin)
const rejectClaim = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId')
      .populate('ownerId');

    if (!claim) {
      return sendError(res, 404, 'Claim not found.');
    }

    const isOwner = claim.ownerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Unauthorized to reject this claim.');
    }

    if (claim.status !== CLAIM_STATUSES.PENDING) {
      return sendError(res, 400, `Claim is already ${claim.status}.`);
    }

    claim.status = CLAIM_STATUSES.REJECTED;
    claim.rejectionReason = rejectionReason || 'Verification details did not match.';
    await claim.save();

    // If no other pending claims, reset item status back to active
    const remainingPending = await Claim.countDocuments({
      itemId: claim.itemId._id,
      status: CLAIM_STATUSES.PENDING,
    });
    if (remainingPending === 0) {
      await Item.findByIdAndUpdate(claim.itemId._id, { status: ITEM_STATUSES.ACTIVE });
    }

    // Notify claimant
    const notification = await Notification.create({
      userId: claim.claimantId._id,
      type: NOTIFICATION_TYPES.CLAIM_REJECTED,
      title: 'Claim Update',
      message: `Your claim for "${claim.itemId.title}" was not approved: ${claim.rejectionReason}`,
      relatedItem: claim.itemId._id,
      relatedClaim: claim._id,
      link: `/claims`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(claim.claimantId._id.toString()).emit('new_notification', notification);
    }

    // Send email
    sendClaimStatusEmail({
      claimant: claim.claimantId,
      item: claim.itemId,
      status: 'rejected',
      rejectionReason: claim.rejectionReason,
    }).catch((err) => console.error(err));

    return sendSuccess(res, 200, 'Claim rejected successfully', { claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete handover / Mark recovery completed
// @route   PUT /api/claims/:id/complete
// @access  Private (Owner or Claimant or Admin)
const completeClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId')
      .populate('ownerId');

    if (!claim) {
      return sendError(res, 404, 'Claim not found.');
    }

    const isOwner = claim.ownerId._id.toString() === req.user._id.toString();
    const isClaimant = claim.claimantId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isClaimant && !isAdmin) {
      return sendError(res, 403, 'Unauthorized.');
    }

    claim.status = CLAIM_STATUSES.COMPLETED;
    await claim.save();

    // Mark item recovered
    const item = await Item.findById(claim.itemId._id);
    if (item) {
      item.status = ITEM_STATUSES.RECOVERED;
      item.recoveredBy = claim.claimantId._id;
      item.recoveredAt = new Date();
      await item.save();
    }

    // Award +30 points to finder and +15 to claimant
    await awardPointsAndCheckBadges(claim.ownerId._id, 30, 'Successful item recovery');
    await User.findByIdAndUpdate(claim.ownerId._id, { $inc: { itemsRecoveredCount: 1 } });

    // Notify both parties to leave feedback
    const notifyFinder = await Notification.create({
      userId: claim.ownerId._id,
      type: NOTIFICATION_TYPES.ITEM_RECOVERED,
      title: 'Item Recovered & Returned!',
      message: `Recovery completed for "${item.title}". Thank you for helping our campus community! Please rate your experience.`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      link: `/items/${item._id}`,
    });

    const notifyClaimant = await Notification.create({
      userId: claim.claimantId._id,
      type: NOTIFICATION_TYPES.ITEM_RECOVERED,
      title: 'Item Successfully Recovered!',
      message: `You recovered "${item.title}". Please leave feedback and rate the finder!`,
      relatedItem: item._id,
      relatedClaim: claim._id,
      link: `/items/${item._id}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(claim.ownerId._id.toString()).emit('new_notification', notifyFinder);
      io.to(claim.claimantId._id.toString()).emit('new_notification', notifyClaimant);
    }

    return sendSuccess(res, 200, 'Handover completed and item marked as recovered!', { claim });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMySubmittedClaims,
  getReceivedClaims,
  getClaimById,
  approveClaim,
  rejectClaim,
  completeClaim,
};
