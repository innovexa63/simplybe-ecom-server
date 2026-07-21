const PromoCard = require('../models/PromoCard');

const DEFAULT_PROMO_CARDS = [
  { position: 'left', title: 'Summer Essentials', subtitle: 'New Season', highlight: 'Up to 50% Off', imageUrl: '/promo_card1.png', linkType: 'category', categoryLink: '/all-things-new' },
  { position: 'right-top', title: 'Be Unlimited', subtitle: 'Delivery Pass', highlight: 'Only £10.99/yr', imageUrl: '/promo_card_pay.png', linkType: 'category', categoryLink: '/be-unlimited' },
  { position: 'right-bottom', title: 'Denim Dreams', subtitle: 'Trending Styles', highlight: 'New Arrivals', imageUrl: '/woman_denim.png', linkType: 'category', categoryLink: '/denim' }
];

// @desc    Get all promo cards
// @route   GET /api/promo-cards
// @access  Public
const getPromoCards = async (req, res) => {
  try {
    const cards = await PromoCard.find().populate('productLink');
    if (!cards || cards.length === 0) {
      return res.json(DEFAULT_PROMO_CARDS);
    }
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get promo card by position
// @route   GET /api/promo-cards/:position
// @access  Public
const getPromoCardByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const card = await PromoCard.findOne({ position }).populate('productLink');
    if (!card) {
      const fallback = DEFAULT_PROMO_CARDS.find(c => c.position === position);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ message: 'Promo card not found for this position' });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update (upsert) promo card by position
// @route   PUT /api/promo-cards/:position
// @access  Private/Admin
const upsertPromoCard = async (req, res) => {
  try {
    const { position } = req.params;
    const { title, subtitle, highlight, linkType, categoryLink, productLink } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    const updateFields = { position };
    if (title !== undefined) updateFields.title = title;
    if (subtitle !== undefined) updateFields.subtitle = subtitle;
    if (highlight !== undefined) updateFields.highlight = highlight;
    if (linkType !== undefined) updateFields.linkType = linkType;
    if (categoryLink !== undefined) updateFields.categoryLink = categoryLink;
    if (productLink !== undefined) updateFields.productLink = productLink || null;
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const card = await PromoCard.findOneAndUpdate(
      { position },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).populate('productLink');

    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete promo card by position
// @route   DELETE /api/promo-cards/:position
// @access  Private/Admin
const deletePromoCard = async (req, res) => {
  try {
    const { position } = req.params;
    const card = await PromoCard.findOneAndDelete({ position });
    if (!card) {
      return res.status(404).json({ message: 'Promo card not found' });
    }
    res.json({ message: 'Promo card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPromoCards,
  getPromoCardByPosition,
  upsertPromoCard,
  deletePromoCard
};
