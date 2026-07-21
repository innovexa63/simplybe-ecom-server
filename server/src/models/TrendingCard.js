const mongoose = require('mongoose');

const trendingCardSchema = new mongoose.Schema(
  {
    imageUrl:   { type: String, required: true },
    title:      { type: String, required: true },
    categories: [{ type: String }],
    order:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrendingCard', trendingCardSchema);
