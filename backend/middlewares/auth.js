const User = require('../models/User');
const jwt = require("jsonwebtoken")

exports.isAuthenticatedUser = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No Authorization header or invalid format');
        return res.status(401).json({ message: 'Login first to access this resource' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Token received:', token.substring(0, 30) + '...');
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user:', decoded.id);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin middleware
exports.isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
};