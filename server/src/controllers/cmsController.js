const HomepageContent = require('../models/HomepageContent');

const DEFAULT_CMS_DATA = {
    socialLinks: {
        facebook: 'https://facebook.com/sandreens',
        instagram: 'https://instagram.com/sandreens',
        tiktok: 'https://tiktok.com/@sandreens',
        youtube: 'https://youtube.com/@sandreens'
    },
    promoCards: [
        {
            title: 'NEW IN FOR SUMMER',
            subtitle: 'Stunning dresses & holiday edits',
            link: '/all-things-new',
            image: '/promo_card1.png'
        },
        {
            title: 'BE UNLIMITED',
            subtitle: 'Unlimited next day delivery for a whole year for just £10.99',
            link: '/be-unlimited',
            image: '/promo_card_pay.png'
        }
    ],
    instagramGrid: [
        { image: '/lifestyle1.png', link: '#' },
        { image: '/lifestyle2.png', link: '#' },
        { image: '/lifestyle3.png', link: '#' }
    ]
};

// @desc    Get a CMS section
// @route   GET /api/cms/:sectionKey
// @access  Public
const getCmsSection = async (req, res) => {
    try {
        const { sectionKey } = req.params;
        const section = await HomepageContent.findOne({ sectionKey });
        if (!section) {
            const fallbackData = DEFAULT_CMS_DATA[sectionKey] || {};
            return res.json({ sectionKey, data: fallbackData });
        }
        res.json(section);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all CMS sections
// @route   GET /api/cms
// @access  Public
const getAllCmsSections = async (req, res) => {
    try {
        const sections = await HomepageContent.find({});
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update a CMS section
// @route   PUT /api/cms/:sectionKey
// @access  Private/Admin
const updateCmsSection = async (req, res) => {
    try {
        const { sectionKey } = req.params;
        const { data } = req.body;

        const section = await HomepageContent.findOneAndUpdate(
            { sectionKey },
            { data },
            { new: true, upsert: true, runValidators: true }
        );

        res.json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getCmsSection, getAllCmsSections, updateCmsSection, DEFAULT_CMS_DATA };
