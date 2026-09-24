const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationMessages,
  sendMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/uploadService');

router.get('/conversations', protect, getConversations);
router.get('/:conversationId', protect, getConversationMessages);
router.post('/', protect, upload.array('attachments', 2), sendMessage);

module.exports = router;
