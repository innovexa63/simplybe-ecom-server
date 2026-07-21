const express = require('express');
const router  = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const cmsUpload = require('../middleware/cmsUpload');
const {
    getTrendingCards,
    createTrendingCard,
    updateTrendingCard,
    deleteTrendingCard,
    reorderTrendingCards,
} = require('../controllers/trendingCardController');

// Public
router.get('/', getTrendingCards);

// Admin only — reorder must come BEFORE /:id so it doesn't match as an id
router.put('/reorder', protect, admin, reorderTrendingCards);

router.post('/',     protect, admin, cmsUpload.single('image'), createTrendingCard);
router.put('/:id',   protect, admin, cmsUpload.single('image'), updateTrendingCard);
router.delete('/:id', protect, admin, deleteTrendingCard);

module.exports = router;
