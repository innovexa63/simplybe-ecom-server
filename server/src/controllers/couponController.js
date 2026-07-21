const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const data = { ...req.body };

    // Khali string gula null banai, jate model e problem na hoy
    ['maxDiscount', 'usageLimit', 'expiryDate'].forEach((f) => {
      if (data[f] === '' || data[f] === undefined) data[f] = null;
    });

    const coupon = await Coupon.create(data);
    res.status(201).json(coupon);
  } catch (error) {
    // Duplicate code hole bujhiye bola
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This coupon code already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
  try {
    const data = { ...req.body };
    ['maxDiscount', 'usageLimit', 'expiryDate'].forEach((f) => {
      if (data[f] === '' || data[f] === undefined) data[f] = null;
    });

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This coupon code already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate a coupon code against a cart subtotal
// @route   POST /api/coupons/validate
// @access  Private (logged-in customer)
// Body: { code, subTotal }
const validateCoupon = async (req, res) => {
  try {
    const { code, subTotal } = req.body;

    if (!code) return res.status(400).json({ message: 'Please enter a coupon code' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }

    const amount = Number(subTotal) || 0;
    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order of £${coupon.minOrderAmount.toFixed(2)} required for this coupon`,
      });
    }

    // Discount hishab
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount; // cap
      }
    } else {
      discount = coupon.discountValue;
    }

    // Discount kokhono subtotal er cheye beshi hote parbe na
    if (discount > amount) discount = amount;

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount: Number(discount.toFixed(2)),
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};