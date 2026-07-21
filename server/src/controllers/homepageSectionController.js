const HomepageSection = require('../models/HomepageSection');

// Home.jsx e ekhon jei section gula ache, oigulai default hisebe seed kortesi.
// Prothombar database faka thakle eigula boshe jabe, tai admin sathe sathe list dekhbe.
const DEFAULT_SECTIONS = [
  { name: 'Hero Banner', key: 'hero', order: 1 },
  { name: 'Pay Sandreens Strip', key: 'payStrip', order: 2 },
  { name: 'Not To Be Missed', key: 'notToMiss', order: 3 },
  { name: 'New In Products', key: 'newIn', order: 4 },
  { name: 'Shop By Category', key: 'categoryShowcase', order: 5 },
  { name: 'Trending Now', key: 'trending', order: 6 },
  { name: "We've Got You", key: 'weveGotYou', order: 7 },
  { name: 'Adidas Collab', key: 'adidas', order: 8 },
  { name: 'Discover Our Brands', key: 'brands', order: 9 },
  { name: 'Instagram Feed', key: 'instagram', order: 10 },
  { name: 'About Sandreens', key: 'about', order: 11 },
];

// @desc    Get all homepage sections (first-time e default seed kore)
// @route   GET /api/homepage-sections
// @access  Public
const getHomepageSections = async (req, res) => {
  try {
    let sections = await HomepageSection.find().sort({ order: 1 });

    if (sections.length === 0) {
      await HomepageSection.insertMany(
        DEFAULT_SECTIONS.map((s) => ({ ...s, isActive: true }))
      );
      sections = await HomepageSection.find().sort({ order: 1 });
    }

    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder / toggle homepage sections
// @route   PUT /api/homepage-sections/reorder
// @access  Private/Admin
// Frontend puro array pathay { sections: [...] }, protita te _id, order, isActive thake
const reorderSections = async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: 'sections must be an array' });
    }

    await Promise.all(
      sections.map((s) =>
        HomepageSection.findByIdAndUpdate(s._id, {
          order: s.order,
          isActive: s.isActive,
        })
      )
    );

    const updated = await HomepageSection.find().sort({ order: 1 });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getHomepageSections, reorderSections };