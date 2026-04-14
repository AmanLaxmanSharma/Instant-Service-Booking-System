const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Admin, VendorUser } = require('../models/User');
const Provider = require('../models/Provider');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper function to get the correct model based on role
const getUserModel = (role = 'user') => {
    switch(role) {
        case 'admin':
            return Admin;
        case 'vendor':
            return VendorUser;
        default:
            return User;
    }
};

// Helper function to find user across all collections
const findUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    if (user) return { user, collection: 'users' };
    
    const admin = await Admin.findOne({ email });
    if (admin) return { admin, collection: 'admins' };
    
    const vendorUser = await VendorUser.findOne({ email });
    if (vendorUser) return { vendorUser, collection: 'vendors_users' };
    
    return null;
};

// Helper function to find user by ID across all collections
const findUserById = async (id) => {
    const user = await User.findById(id);
    if (user) return { user, collection: 'users' };
    
    const admin = await Admin.findById(id);
    if (admin) return { admin, collection: 'admins' };
    
    const vendorUser = await VendorUser.findById(id);
    if (vendorUser) return { vendorUser, collection: 'vendors_users' };
    
    return null;
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['user', 'vendor', 'admin']).withMessage('Invalid role')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role = 'user', phone } = req.body;

        // Check if user already exists across all collections
        const existingUserResult = await findUserByEmail(email);
        if (existingUserResult) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Get appropriate model based on role
        const UserModel = getUserModel(role);

        // Create user in appropriate collection
        const user = await UserModel.create({
            name,
            email,
            password,
            role,
            phone
        });

        // If vendor, automatically create provider profile
        if (role === 'vendor') {
            try {
                await Provider.create({
                    user: user._id,
                    businessName: name,
                    description: '',
                    serviceType: 'other',
                    services: [],
                    location: {
                        address: {
                            street: '',
                            city: '',
                            state: '',
                            zipCode: ''
                        },
                        coordinates: {
                            type: 'Point',
                            coordinates: [0, 0]
                        }
                    },
                    rating: 5,
                    isAvailable: true,
                    status: 'pending'
                });
            } catch (providerError) {
                console.error('Error creating provider profile:', providerError);
            }
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').exists().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user across all collections
        const userResult = await findUserByEmail(email);
        
        if (!userResult) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Get the user document
        const UserModel = getUserModel(userResult.user?.role || userResult.admin?.role || userResult.vendorUser?.role);
        const user = await UserModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    lastLogin: user.lastLogin
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const userResult = await findUserById(req.user._id);

        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.user || userResult.admin || userResult.vendorUser;

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
    protect,
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('phone').optional().trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 characters'),
    body('address').optional().isObject().withMessage('Address must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, phone, address } = req.body;

        const userResult = await findUserById(req.user._id);
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        const UserModel = getUserModel(userResult.user?.role || userResult.admin?.role || userResult.vendorUser?.role);
        const user = await UserModel.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
    protect,
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const userResult = await findUserById(req.user._id);
        if (!userResult) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user with password
        const UserModel = getUserModel(userResult.user?.role || userResult.admin?.role || userResult.vendorUser?.role);
        const user = await UserModel.findById(req.user._id).select('+password');

        // Check current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;