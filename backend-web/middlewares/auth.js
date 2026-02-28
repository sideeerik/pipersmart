const User = require('../models/User');
const jwt = require("jsonwebtoken")

exports.isAuthenticatedUser = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Login first to access this resource' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            console.error('❌ User not found in DB for token ID:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }
        
        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
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