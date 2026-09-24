const express = require('express');
const router = express.Router();
const {
  createAlert,
  getMyAlerts,
  deleteAlert,
  toggleAlert,
} = require('../controllers/smartAlertController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createAlert);
router.get('/', protect, getMyAlerts);
router.delete('/:id', protect, deleteAlert);
router.put('/:id/toggle', protect, toggleAlert);

module.exports = router;
