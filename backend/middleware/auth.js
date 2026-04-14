const jwt = require('jsonwebtoken');
const { User, Admin, VendorUser } = require('../models/User');

// Helper function to find user by ID across all collections
const findUserById = async (id) => {
    const user = await User.findById(id).select('-password');
    if (user) return user;
    
    const admin = await Admin.findById(id).select('-password');
    if (admin) return admin;
    
    const vendorUser = await VendorUser.findById(id).select('-password');
    if (vendorUser) return vendorUser;
    
    return null;
};

// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token across all collections
            const user = await findUserById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'No user found with this token'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await findUserById(decoded.id);

                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Silently fail for optional auth
                console.log('Optional auth failed:', error.message);
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    protect,
    authorize,
    optionalAuth
};