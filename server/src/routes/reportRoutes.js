const express = require('express');
const router = express.Router();
const { createReport, getMyReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadService');

router.post('/', protect, upload.array('evidenceImages', 3), createReport);
router.get('/my', protect, getMyReports);

module.exports = router;
