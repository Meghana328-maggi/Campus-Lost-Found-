const express = require('express');
const router = express.Router();
const {
  toggleBookmark,
  getMyBookmarks,
  checkBookmarkStatus,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.post('/toggle', protect, toggleBookmark);
router.get('/', protect, getMyBookmarks);
router.get('/check/:itemId', protect, checkBookmarkStatus);

module.exports = router;
