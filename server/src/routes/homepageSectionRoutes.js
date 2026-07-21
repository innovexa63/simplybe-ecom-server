const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getHomepageSections,
  reorderSections,
} = require('../controllers/homepageSectionController');

// reorder route ta specific, tai age rakha holo
router.put('/reorder', protect, admin, reorderSections);
router.get('/', getHomepageSections);

module.exports = router;