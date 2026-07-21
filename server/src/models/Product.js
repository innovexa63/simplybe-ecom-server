const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0, default: null },
    badge: {
        type: String,
        enum: ['40% OFF', '60% OFF', 'Sale', 'New In', null, ''],
        default: null
    },
    isTrending: { type: Boolean, default: false },
    images: [{ type: String }], // Cloudinary URLs
    imageUrl: { type: String }, // kept for backward compat
    category: { type: String, required: true },
    subcategory: { type: String, default: null },
    brand: { type: String, default: null },
    sizes: [{
        type: String,
        enum: ['10','12','14','16','18','20','22','24','26','28','30','32','One Size','S','M','L','XL']
    }],
    inStock: { type: Boolean, default: true },
    stock: { type: Number, min: 0, default: 0 },
    sku: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    materials: { type: String, default: '' },
    careInstructions: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
