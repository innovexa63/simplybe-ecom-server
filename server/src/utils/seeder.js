const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const HomepageContent = require('../models/HomepageContent');

const seedData = async () => {
    try {
        // 1. Seed Super Admin & Admin Users
        const superAdminExists = await User.findOne({ email: 'sandreens.26@gmail.com' });
        if (!superAdminExists) {
            await User.create({
                name: 'Sandreens Super Admin',
                email: 'sandreens.26@gmail.com',
                password: 'Admin@1234',
                role: 'superadmin'
            });
            console.log('✅ Super Admin user seeded (sandreens.26@gmail.com / Admin@1234)');
        } else if (superAdminExists.role !== 'superadmin') {
            superAdminExists.role = 'superadmin';
            await superAdminExists.save();
        }

        const adminExists = await User.findOne({ email: 'admin@sandreens.com' });
        if (!adminExists) {
            await User.create({
                name: 'Sandreens Admin',
                email: 'admin@sandreens.com',
                password: 'Admin@1234',
                role: 'admin'
            });
            console.log('✅ Admin user seeded (admin@sandreens.com / Admin@1234)');
        }

        // 2. Seed default categories if none exist
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const categories = [
                { name: 'Dresses', slug: 'dresses', type: 'product' },
                { name: 'Tops', slug: 'tops', type: 'product' },
                { name: 'Footwear', slug: 'footwear', type: 'product' },
                { name: 'Lingerie & Nightwear', slug: 'lingerie-nightwear', type: 'product' },
                { name: 'Activewear', slug: 'activewear', type: 'product' },
                { name: 'Accessories', slug: 'accessories', type: 'product' },
                { name: 'Adidas', slug: 'adidas', type: 'brand' },
                { name: 'Levi\'s', slug: 'levis', type: 'brand' },
                { name: 'MANGO', slug: 'mango', type: 'brand' }
            ];
            const seededCats = await Category.insertMany(categories);
            console.log('✅ Default categories seeded');

            // Seed subcategories
            const dressesCat = seededCats.find(c => c.name === 'Dresses');
            const footwearCat = seededCats.find(c => c.name === 'Footwear');

            if (dressesCat && footwearCat) {
                const subcategories = [
                    { name: 'Maxi Dresses', slug: 'maxi-dresses', type: 'product', parentCategory: dressesCat._id },
                    { name: 'Midi Dresses', slug: 'midi-dresses', type: 'product', parentCategory: dressesCat._id },
                    { name: 'Sandals', slug: 'sandals', type: 'product', parentCategory: footwearCat._id },
                    { name: 'Trainers', slug: 'trainers', type: 'product', parentCategory: footwearCat._id }
                ];
                await Category.insertMany(subcategories);
                console.log('✅ Default subcategories seeded');
            }
        }

        // 3. Seed default products if none exist
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const products = [
                {
                    name: 'Greek Seaside Blue Dress',
                    description: 'Beautiful linen blend dress perfect for summer getaways and seaside strolls.',
                    price: 49.99,
                    salePrice: 39.99,
                    badge: 'New In',
                    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'],
                    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
                    category: 'Dresses',
                    subcategory: 'Maxi Dresses',
                    brand: 'Sandreens',
                    sizes: ['10', '12', '14', '16', '18'],
                    inStock: true,
                    stock: 50
                },
                {
                    name: 'Denim Utility Jumpsuit',
                    description: 'Structured denim jumpsuit with short sleeves, patch pockets, and self-tie belt.',
                    price: 55.00,
                    salePrice: null,
                    badge: null,
                    images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500'],
                    imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500',
                    category: 'Dresses',
                    subcategory: 'Midi Dresses',
                    brand: 'Sandreens',
                    sizes: ['12', '14', '16', '20'],
                    inStock: true,
                    stock: 35
                },
                {
                    name: 'Active Black Leggings',
                    description: 'High-waisted active leggings with compression support and side drop-in pockets.',
                    price: 24.99,
                    salePrice: 14.99,
                    badge: '40% OFF',
                    images: ['https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=500'],
                    imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=500',
                    category: 'Activewear',
                    brand: 'Adidas',
                    sizes: ['S', 'M', 'L', 'XL'],
                    inStock: true,
                    stock: 20
                }
            ];
            await Product.insertMany(products);
            console.log('✅ Default products seeded');
        }

        // 4. Seed default CMS sections if none exist
        const cmsCount = await HomepageContent.countDocuments();
        if (cmsCount === 0) {
            const cmsData = [
                {
                    sectionKey: 'hero',
                    data: {
                        title: 'SUMMER LIVING',
                        subtitle: 'The new you need',
                        ctaText: "See what's new",
                        ctaLink: '/all-things-new',
                        desktopImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600',
                        mobileImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
                    }
                },
                {
                    sectionKey: 'announcement',
                    data: {
                        text: '20% off* Fashion & Home use code: JETSET',
                        link: '#',
                        linkText: '*T&Cs apply'
                    }
                },
                {
                    sectionKey: 'hotRightNow',
                    data: {
                        title: 'Hot Right Now',
                        buttons: [
                            { label: 'Shop New In', link: '/products?badge=New In' },
                            { label: 'Shop Sandals', link: '/products?category=Footwear' },
                            { label: 'Shop Tops', link: '/products?category=Tops' }
                        ]
                    }
                },
                {
                    sectionKey: 'promoCards',
                    data: {
                        cards: [
                            { title: 'Garden Patio', subtitle: 'pay sandreens.', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', link: '#', theme: '#f6ede6' },
                            { title: 'Denim Jumpsuit', subtitle: 'yellow details', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800', link: '#', theme: '#000' }
                        ]
                    }
                },
                {
                    sectionKey: 'instagramGrid',
                    data: {
                        profileUrl: 'https://instagram.com/sandreens',
                        images: [
                            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
                            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
                            'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400',
                            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400'
                        ]
                    }
                }
            ];
            await HomepageContent.insertMany(cmsData);
            console.log('✅ Default CMS content seeded');
        }

    } catch (error) {
        console.error('❌ Database seeding failed:', error.message);
    }
};

module.exports = seedData;
