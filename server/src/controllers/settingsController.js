const Settings = require('../models/Settings');

// Sob shomoy ekta document e kaj kortesi. Na thakle banai (upsert-er moto).
const getSettingsDoc = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public (user panel eo lagbe: footer, contact info ityadi)
const getSettings = async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const settings = await getSettingsDoc();

    const fields = [
      'logo', 'favicon', 'contactEmail', 'contactPhone', 'contactAddress',
      'termsConditions', 'privacyPolicy', 'footerText',
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) settings[f] = req.body[f];
    });

    if (req.body.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks.toObject(),
        ...req.body.socialLinks,
      };
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };