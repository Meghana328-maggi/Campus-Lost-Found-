const express = require('express');
const router = express.Router();
const { createFeedback, getItemFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createFeedback);
router.get('/item/:itemId', getItemFeedback);

module.exports = router;
