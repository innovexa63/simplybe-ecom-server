const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getFaqs, createFaq, updateFaq, deleteFaq } = require('../controllers/faqController');

router.get('/', getFaqs);
router.post('/', protect, admin, createFaq);
router.put('/:id', protect, admin, updateFaq);
router.delete('/:id', protect, admin, deleteFaq);

module.exports = router;