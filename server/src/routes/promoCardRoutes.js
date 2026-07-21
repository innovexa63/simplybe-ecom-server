const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const cmsUpload = require('../middleware/cmsUpload');
const {
  getPromoCards,
  getPromoCardByPosition,
  upsertPromoCard,
  deletePromoCard,
} = require('../controllers/promoCardController');

// Public routes
router.get('/', getPromoCards);
router.get('/:position', getPromoCardByPosition);

// Admin routes (position-based upsert & delete)
router.put('/:position', protect, admin, cmsUpload.single('image'), upsertPromoCard);
router.post('/:position', protect, admin, cmsUpload.single('image'), upsertPromoCard);
router.delete('/:position', protect, admin, deletePromoCard);

module.exports = router;
