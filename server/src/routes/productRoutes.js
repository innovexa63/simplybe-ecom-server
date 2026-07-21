const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductReviews, createProductReview } = require('../controllers/productController');

// Cloudinary + Multer setup
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder: 'simplybe/products', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] }
});

const upload = multer({ storage });

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.array('images', 8), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.array('images', 8), updateProduct)
    .delete(protect, admin, deleteProduct);

    router.route('/:id/reviews')
    .get(getProductReviews)
    .post(protect, createProductReview);

module.exports = router;
