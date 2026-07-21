const mongoose = require('mongoose');

// Puro site er jonno EKTA i settings document thakbe (singleton pattern)
const settingsSchema = new mongoose.Schema(
  {
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      pinterest: { type: String, default: '' },
    },
    termsConditions: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
    footerText: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);