const mongoose = require('mongoose');

const promoCardSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
      unique: true,
      enum: ['left', 'right-top', 'right-bottom'],
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    highlight: { type: String, default: '' },
    linkType: { type: String, enum: ['category', 'product'], default: 'category' },
    categoryLink: { type: String, default: '' },
    productLink: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCard', promoCardSchema);
