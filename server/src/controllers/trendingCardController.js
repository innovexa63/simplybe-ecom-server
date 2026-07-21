const TrendingCard = require('../models/TrendingCard');

// @desc  Get all trending cards (sorted by order)
// @route GET /api/trending-cards
// @access Public
const getTrendingCards = async (req, res) => {
    try {
        const cards = await TrendingCard.find().sort({ order: 1, createdAt: 1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Create a trending card
// @route POST /api/trending-cards
// @access Private/Admin
const createTrendingCard = async (req, res) => {
    try {
        const count = await TrendingCard.countDocuments();
        if (count >= 4) {
            return res.status(400).json({ message: 'Maximum 4 trending cards allowed' });
        }

        const { title, categories } = req.body;
        const imageUrl = req.file ? req.file.path : req.body.imageUrl;

        if (!imageUrl) return res.status(400).json({ message: 'Image is required' });
        if (!title)    return res.status(400).json({ message: 'Title is required' });

        const cats = categories
            ? (Array.isArray(categories) ? categories : categories.split(',').map(c => c.trim()).filter(Boolean))
            : [];

        const card = await TrendingCard.create({
            imageUrl,
            title,
            categories: cats,
            order: count, // append at end
        });

        res.status(201).json(card);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc  Update a trending card
// @route PUT /api/trending-cards/:id
// @access Private/Admin
const updateTrendingCard = async (req, res) => {
    try {
        const card = await TrendingCard.findById(req.params.id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        const { title, categories, imageUrl: bodyImage } = req.body;

        if (req.file) card.imageUrl = req.file.path;
        else if (bodyImage) card.imageUrl = bodyImage;

        if (title)      card.title = title;
        if (categories !== undefined) {
            card.categories = Array.isArray(categories)
                ? categories
                : categories.split(',').map(c => c.trim()).filter(Boolean);
        }

        const updated = await card.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc  Delete a trending card
// @route DELETE /api/trending-cards/:id
// @access Private/Admin
const deleteTrendingCard = async (req, res) => {
    try {
        const card = await TrendingCard.findByIdAndDelete(req.params.id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        // Re-assign order values after deletion
        const remaining = await TrendingCard.find().sort({ order: 1 });
        await Promise.all(remaining.map((c, i) => TrendingCard.findByIdAndUpdate(c._id, { order: i })));

        res.json({ message: 'Card deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Reorder trending cards
// @route PUT /api/trending-cards/reorder
// @access Private/Admin
// Body: { orderedIds: ['id1', 'id2', 'id3', 'id4'] }
const reorderTrendingCards = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'orderedIds must be an array' });
        }

        await Promise.all(
            orderedIds.map((id, index) =>
                TrendingCard.findByIdAndUpdate(id, { order: index })
            )
        );

        res.json({ message: 'Order updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTrendingCards,
    createTrendingCard,
    updateTrendingCard,
    deleteTrendingCard,
    reorderTrendingCards,
};
