const mongoose = require('mongoose');

const homepageSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },      // Admin e dekhabe (e.g. "Hero Banner")
    key: { type: String, required: true, unique: true }, // code e chinbe (e.g. "hero")
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);