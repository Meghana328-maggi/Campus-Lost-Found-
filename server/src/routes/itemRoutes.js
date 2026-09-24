const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemMatches,
  checkDuplicates,
  markItemRecovered,
  getMyItems,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../utils/uploadService');

router.get('/', optionalAuth, getItems);
router.post('/', protect, upload.array('images', 5), createItem);
router.post('/check-duplicates', checkDuplicates);
router.get('/user/me', protect, getMyItems);

router.get('/:id', optionalAuth, getItemById);
router.put('/:id', protect, upload.array('images', 5), updateItem);
router.delete('/:id', protect, deleteItem);
router.get('/:id/matches', getItemMatches);
router.put('/:id/recover', protect, markItemRecovered);

module.exports = router;
