const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT from httpOnly cookie or Bearer header
const protect = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Admin access (both admin and superadmin)
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.email === 'sandreens.26@gmail.com')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Superadmin access only (sandreens.26@gmail.com or superadmin role)
const superadmin = (req, res, next) => {
    if (req.user && (req.user.role === 'superadmin' || req.user.email === 'sandreens.26@gmail.com')) {
        next();
    } else {
        res.status(403).json({ message: 'Only Super Admin is authorized to perform this action' });
    }
};

module.exports = { protect, admin, superadmin };
