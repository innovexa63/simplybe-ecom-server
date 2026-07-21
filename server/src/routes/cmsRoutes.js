const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getCmsSection, getAllCmsSections, updateCmsSection } = require('../controllers/cmsController');
const cmsUpload = require('../middleware/cmsUpload');
// Banner/CMS image upload
router.post('/upload-image', protect, admin, cmsUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  res.json({ url: req.file.path });
});
router.get('/', getAllCmsSections);
router.get('/:sectionKey', getCmsSection);
router.put('/:sectionKey', protect, admin, updateCmsSection);

module.exports = router;
