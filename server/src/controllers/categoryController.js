const Category = require('../models/Category');

const getCategories = async (req, res) => {
    try {
        const { type } = req.query;
        const filter = type ? { type } : {};
        const categories = await Category.find(filter)
            .populate('parentCategory', 'name')
            .sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, slug, type, parentCategory } = req.body;
        const image = req.file ? req.file.path : req.body.image || null;
        const category = await Category.create({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
            image,
            type,
            parentCategory: parentCategory || null
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        const { name, slug, type, isActive, parentCategory } = req.body;
        const image = req.file ? req.file.path : req.body.image || category.image;
        category.name = name || category.name;
        category.slug = slug || category.slug;
        category.type = type || category.type;
        category.image = image;
        category.isActive = isActive !== undefined ? isActive : category.isActive;
        category.parentCategory = parentCategory !== undefined ? (parentCategory || null) : category.parentCategory;
        const updated = await category.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
