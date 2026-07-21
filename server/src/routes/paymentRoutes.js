const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCheckoutSession, verifyCheckoutSession } = require('../controllers/paymentController');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify/:sessionId', protect, verifyCheckoutSession);

module.exports = router;