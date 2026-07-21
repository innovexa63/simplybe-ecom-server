const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // JETSET, jetset — dutoi ek jinish
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage',
    },
    // percentage hole 20 mane 20%, fixed hole 10 mane £10
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Percentage discount er maximum cap (optional). Jemon 50% off but max £30 obdi.
    maxDiscount: {
      type: Number,
      default: null,
    },
    // Ei amount er kome order hole coupon kaj korbe na
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    // Koto bar total byabohar kora jabe (null = unlimited)
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null, // null = kono expiry nei
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);