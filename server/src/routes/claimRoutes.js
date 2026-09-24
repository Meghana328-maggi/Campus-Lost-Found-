const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMySubmittedClaims,
  getReceivedClaims,
  getClaimById,
  approveClaim,
  rejectClaim,
  completeClaim,
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadService');

router.post('/', protect, upload.array('proofImages', 3), createClaim);
router.get('/my', protect, getMySubmittedClaims);
router.get('/received', protect, getReceivedClaims);
router.get('/:id', protect, getClaimById);
router.put('/:id/approve', protect, approveClaim);
router.put('/:id/reject', protect, rejectClaim);
router.put('/:id/complete', protect, completeClaim);

module.exports = router;
