const express = require('express');
const router = express.Router();
const {
  getMyConversation,
  getAllConversations,
  getMessages,
  uploadChatImage,
} = require('../controllers/chatController');

// authMiddleware.js theke e protect + admin duitai export hoy
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/chatUpload');

router.get('/conversation', protect, getMyConversation);
router.get('/conversations', protect, admin, getAllConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/upload-image', protect, upload.single('image'), uploadChatImage);

module.exports = router;