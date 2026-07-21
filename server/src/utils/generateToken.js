const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT and set as httpOnly cookie
const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,        // cross-site cookie er jonno always true lagbe
        sameSite: 'none',    // cross-domain (vercel <-> render) cookie allow korar jonno
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return token;
};

module.exports = generateToken;
