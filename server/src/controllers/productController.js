const Product = require('../models/Product');
const Review = require('../models/Review');
// @desc    Get all products (with optional filters)
// @route   GET /api/products
// @access  Public
// const getProducts = async (req, res) => {
//     try {
//         const { category, subcategory, brand, inStock, badge, search, minDiscount, isTrending } = req.query;
//         const filter = {};
//         if (category) filter.category = category;
//         if (subcategory) filter.subcategory = subcategory;
//         if (brand) filter.brand = brand;
//         if (inStock !== undefined) filter.inStock = inStock === 'true';
//         if (badge) filter.badge = badge;
//         if (isTrending !== undefined) filter.isTrending = isTrending === 'true';
//         if (search) filter.name = { $regex: search, $options: 'i' };

//         let products = await Product.find(filter).sort({ createdAt: -1 });

//         // Filter by actual discount percentage (e.g. minDiscount=40 means 40%-100% off)
//         if (minDiscount !== undefined) {
//             const min = Number(minDiscount);
//             products = products.filter(p => {
//                 if (!p.salePrice || !p.price || p.price <= 0) return false;
//                 const discountPct = ((p.price - p.salePrice) / p.price) * 100;
//                 return discountPct >= min;
//             });
//         }

//         res.json(products);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getProducts = async (req, res) => {
    try {
        const {
            category, subcategory, brand, inStock, badge, search, minDiscount,
            isTrending, minPrice, maxPrice, sizes, sort
        } = req.query;

        const filter = {};
        // Category — single or comma-separated multiple: "Dresses,Tops"
        if (category) {
            const catList = category.split(',').map(c => c.trim()).filter(Boolean);
            filter.category = catList.length > 1 ? { $in: catList } : catList[0];
        }
        if (subcategory) filter.subcategory = subcategory;
        if (inStock !== undefined) filter.inStock = inStock === 'true';
        if (badge) filter.badge = badge;
        if (search) filter.name = { $regex: search, $options: 'i' };
        if (isTrending !== undefined) filter.isTrending = isTrending === 'true';

        // Brand — ekadhik brand comma diye ashte pare (adidas,MANGO)
        if (brand) {
            const brandList = brand.split(',').map(b => b.trim()).filter(Boolean);
            filter.brand = brandList.length > 1 ? { $in: brandList } : brandList[0];
        }

        // Sizes — ekadhik size comma diye (10,12,14)
        if (sizes) {
            const sizeList = sizes.split(',').map(s => s.trim()).filter(Boolean);
            if (sizeList.length > 0) filter.sizes = { $in: sizeList };
        }

        // Sort option
        let sortOption = { createdAt: -1 }; // default: newest first
        if (sort === 'price-asc') sortOption = { price: 1 };
        else if (sort === 'price-desc') sortOption = { price: -1 };
        else if (sort === 'name-asc') sortOption = { name: 1 };
        else if (sort === 'oldest') sortOption = { createdAt: 1 };

        let products = await Product.find(filter).sort(sortOption);

        // Price range — salePrice thakle shetai asol dam, tai memory te filter kori
        if (minPrice !== undefined || maxPrice !== undefined) {
            const min = minPrice !== undefined ? Number(minPrice) : 0;
            const max = maxPrice !== undefined ? Number(maxPrice) : Infinity;
            products = products.filter(p => {
                const effectivePrice = p.salePrice ?? p.price;
                return effectivePrice >= min && effectivePrice <= max;
            });
        }

        // Discount percentage filter
        if (minDiscount !== undefined) {
            const min = Number(minDiscount);
            products = products.filter(p => {
                if (!p.salePrice || !p.price || p.price <= 0) return false;
                const discountPct = ((p.price - p.salePrice) / p.price) * 100;
                return discountPct >= min;
            });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, description, price, salePrice, badge, category, subcategory, brand, sizes, inStock, stock, isTrending, sku, dimensions, materials, careInstructions } = req.body;

        // Handle multiple uploaded images from Cloudinary via multer
        const images = req.files ? req.files.map(f => f.path) : [];
        const imageUrl = images[0] || req.body.imageUrl || '';

        const product = await Product.create({
            name, description, price,
            salePrice: salePrice || null,
            badge: badge || null,
            images,
            imageUrl,
            category,
            subcategory: subcategory || null,
            brand: brand || null,
            sizes: sizes ? (Array.isArray(sizes) ? sizes : [sizes]) : [],
            inStock: inStock !== false,
            stock: stock || 0,
            isTrending: isTrending === 'true' || isTrending === true,
            sku: sku || '',
            dimensions: dimensions || '',
            materials: materials || '',
            careInstructions: careInstructions ? (Array.isArray(careInstructions) ? careInstructions : [careInstructions]) : []
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, description, price, salePrice, badge, category, subcategory, brand, sizes, inStock, stock, isTrending, sku, dimensions, materials, careInstructions } = req.body;

        const newImages = req.files ? req.files.map(f => f.path) : [];
        // Frontend theke jei purono chhobi rakhte bola hoyeche (existingImages), tar sathe notun gula jog kori
        let keptImages = product.images;
        if (req.body.existingImages !== undefined) {
            keptImages = Array.isArray(req.body.existingImages)
                ? req.body.existingImages
                : [req.body.existingImages]; // ekta hole string ashe, array baniye ni
        }
        const images = [...keptImages, ...newImages];

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;
        product.badge = badge !== undefined ? (badge === '' ? null : badge) : product.badge;
        product.images = images;
        product.imageUrl = images[0] || product.imageUrl;
        product.category = category || product.category;
        product.subcategory = subcategory !== undefined ? subcategory : product.subcategory;
        product.brand = brand !== undefined ? brand : product.brand;
        product.sizes = sizes ? (Array.isArray(sizes) ? sizes : [sizes]) : product.sizes;
        product.inStock = inStock !== undefined ? inStock : product.inStock;
        product.stock = stock !== undefined ? stock : product.stock;
        product.isTrending = isTrending !== undefined ? (isTrending === 'true' || isTrending === true) : product.isTrending;
        product.sku = sku !== undefined ? sku : product.sku;
        product.dimensions = dimensions !== undefined ? dimensions : product.dimensions;
        product.materials = materials !== undefined ? materials : product.materials;
        product.careInstructions = careInstructions ? (Array.isArray(careInstructions) ? careInstructions : [careInstructions]) : product.careInstructions;

        const updated = await product.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if this user already reviewed this product
        const alreadyReviewed = await Review.findOne({
            product: req.params.id,
            user: req.user._id
        });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            product: req.params.id,
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductReviews, createProductReview };
