const express = require('express');
const { body, validationResult } = require('express-validator');
const Provider = require('../models/Provider');
const { User, Admin, VendorUser } = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const geolib = require('geolib');

const router = express.Router();

// @desc    Get all providers
// @route   GET /api/providers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            serviceType,
            latitude,
            longitude,
            radius = 25, // default 25km radius
            page = 1,
            limit = 10,
            sortBy = 'rating',
            sortOrder = 'desc'
        } = req.query;

        let query = { status: 'approved', isAvailable: true };

        // Filter by service type
        if (serviceType) {
            query.serviceType = serviceType;
        }

        // Location-based filtering
        let locationQuery = {};
        if (latitude && longitude) {
            locationQuery = {
                'location.coordinates': {
                    $geoWithin: {
                        $centerSphere: [
                            [parseFloat(longitude), parseFloat(latitude)],
                            parseFloat(radius) / 6371 // convert km to radians
                        ]
                    }
                }
            };
        }

        // Combine queries
        const finalQuery = { ...query, ...locationQuery };

        // Sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
            populate: {
                path: 'user',
                select: 'name email phone'
            }
        };

        const result = await Provider.paginate(finalQuery, options);

        // Calculate distance for each provider if coordinates provided
        if (latitude && longitude) {
            result.docs.forEach(provider => {
                if (provider.location && provider.location.coordinates) {
                    provider.distance = geolib.getDistance(
                        { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
                        {
                            latitude: provider.location.coordinates.latitude,
                            longitude: provider.location.coordinates.longitude
                        }
                    );
                }
            });
        }

        res.json({
            success: true,
            data: {
                providers: result.docs,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.totalDocs,
                    pages: result.totalPages
                }
            }
        });
    } catch (error) {
        console.error('Get providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create provider profile
// @route   POST /api/providers
// @access  Private (Vendor only)
router.post('/', [
    protect,
    authorize('vendor'),
    body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('serviceType').isIn(['cleaning', 'plumbing', 'electrician', 'appliance', 'carpentry', 'painting', 'gardening', 'pest-control', 'other']).withMessage('Valid service type is required'),
    body('location.address').isObject().withMessage('Address is required'),
    body('location.coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('location.coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
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

        // Check if user already has a provider profile
        const existingProvider = await Provider.findOne({ user: req.user._id });
        if (existingProvider) {
            return res.status(400).json({
                success: false,
                message: 'Provider profile already exists'
            });
        }

        const providerData = {
            ...req.body,
            user: req.user._id,
            status: 'pending' // Requires admin approval
        };

        const provider = await Provider.create(providerData);

        await provider.populate('user', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Provider profile created successfully. Awaiting approval.',
            data: {
                provider
            }
        });
    } catch (error) {
        console.error('Create provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during provider creation'
        });
    }
});

// @desc    Get current vendor's provider profile
// @route   GET /api/providers/profile
// @access  Private (Vendor only)
router.get('/profile', protect, authorize('vendor'), async (req, res) => {
    try {
        const provider = await Provider.findOne({ user: req.user._id })
            .populate('user', 'name email phone');

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found'
            });
        }

        res.json({
            success: true,
            data: {
                provider
            }
        });
    } catch (error) {
        console.error('Get vendor profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update current vendor's provider profile
// @route   PUT /api/providers/profile
// @access  Private (Vendor only)
router.put('/profile', [
    protect,
    authorize('vendor'),
    body('businessName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('services').optional().isArray().withMessage('Services must be an array'),
    body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
    body('businessHours').optional().isObject().withMessage('Business hours must be an object')
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

        const provider = await Provider.findOne({ user: req.user._id });
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found'
            });
        }

        // Prevent status changes by vendor
        if (req.body.status) {
            delete req.body.status;
        }

        const updatedProvider = await Provider.findByIdAndUpdate(
            provider._id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email phone');

        res.json({
            success: true,
            message: 'Provider profile updated successfully',
            data: {
                provider: updatedProvider
            }
        });
    } catch (error) {
        console.error('Update vendor profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during provider update'
        });
    }
});

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id)
            .populate('user', 'name email phone');

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        // Only return approved providers to public
        if (provider.status !== 'approved') {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        res.json({
            success: true,
            data: {
                provider
            }
        });
    } catch (error) {
        console.error('Get provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update provider profile
// @route   PUT /api/providers/:id
// @access  Private (Provider owner or Admin)
router.put('/:id', [
    protect,
    body('businessName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2 and 100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('services').optional().isArray().withMessage('Services must be an array'),
    body('contactInfo').optional().isObject().withMessage('Contact info must be an object'),
    body('businessHours').optional().isObject().withMessage('Business hours must be an object')
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

        const provider = await Provider.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        // Check permissions
        const isOwner = provider.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this provider profile'
            });
        }

        // Prevent status changes by non-admins
        if (req.body.status && !isAdmin) {
            delete req.body.status;
        }

        const updatedProvider = await Provider.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('user', 'name email phone');

        res.json({
            success: true,
            message: 'Provider profile updated successfully',
            data: {
                provider: updatedProvider
            }
        });
    } catch (error) {
        console.error('Update provider error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during provider update'
        });
    }
});

// @desc    Get provider dashboard stats
// @route   GET /api/providers/dashboard/stats
// @access  Private (Vendor only)
router.get('/dashboard/stats', protect, authorize('vendor'), async (req, res) => {
    try {
        const provider = await Provider.findOne({ user: req.user._id });
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found'
            });
        }

        // Get booking statistics
        const stats = await require('../models/Booking').aggregate([
            { $match: { provider: provider._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'completed'] },
                                '$payment.amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const bookingStats = {
            pending: 0,
            confirmed: 0,
            'in-progress': 0,
            completed: 0,
            cancelled: 0,
            totalRevenue: 0
        };

        stats.forEach(stat => {
            bookingStats[stat._id] = stat.count;
            if (stat._id === 'completed') {
                bookingStats.totalRevenue = stat.totalRevenue;
            }
        });

        res.json({
            success: true,
            data: {
                provider: {
                    id: provider._id,
                    businessName: provider.businessName,
                    status: provider.status,
                    rating: provider.rating,
                    totalReviews: provider.totalReviews
                },
                stats: bookingStats
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Seed providers (for development/testing)
// @route   POST /api/providers/seed
// @access  Private (Admin only)
router.post('/seed', protect, authorize('admin'), async (req, res) => {
    try {
        const mockProviders = [
            {
                businessName: "John's Cleaning Services",
                description: "Professional cleaning services for homes and offices",
                serviceType: "cleaning",
                location: {
                    address: { street: "123 Main St", city: "San Francisco", state: "CA", zipCode: "94102" },
                    coordinates: { latitude: 37.7749, longitude: -122.4194 }
                },
                contactInfo: { phone: "+1-555-0101", email: "john@cleaningservices.com" },
                services: [
                    { name: "Deep Cleaning", description: "Complete home deep cleaning", price: 150, duration: 180, isActive: true },
                    { name: "Regular Cleaning", description: "Regular maintenance cleaning", price: 80, duration: 120, isActive: true }
                ],
                status: "approved",
                isAvailable: true,
                rating: 4.8,
                totalReviews: 25
            },
            {
                businessName: "Mike's Plumbing",
                description: "Expert plumbing services for residential and commercial",
                serviceType: "plumbing",
                location: {
                    address: { street: "456 Oak Ave", city: "San Francisco", state: "CA", zipCode: "94103" },
                    coordinates: { latitude: 37.7849, longitude: -122.4094 }
                },
                contactInfo: { phone: "+1-555-0102", email: "mike@plumbingservices.com" },
                services: [
                    { name: "Pipe Repair", description: "Fix leaking pipes and plumbing issues", price: 120, duration: 90, isActive: true },
                    { name: "Drain Cleaning", description: "Clear clogged drains", price: 80, duration: 60, isActive: true }
                ],
                status: "approved",
                isAvailable: true,
                rating: 4.9,
                totalReviews: 32
            }
        ];

        // Create providers with associated users
        const providers = [];
        for (const mockProvider of mockProviders) {
            // Create a vendor user for each provider
            const vendorUser = await VendorUser.create({
                name: mockProvider.businessName,
                email: `vendor${providers.length + 1}@example.com`,
                password: 'password123',
                role: 'vendor'
            });

            mockProvider.user = vendorUser._id;
            const provider = await Provider.create(mockProvider);
            providers.push(provider);
        }

        res.json({
            success: true,
            message: `${providers.length} providers seeded successfully`,
            data: {
                providers
            }
        });
    } catch (error) {
        console.error('Seed providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during seeding'
        });
    }
});

// @desc    Get providers matching user location
// @route   GET /api/providers/match/by-location
// @access  Public
router.get('/match/by-location', async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            radius = 25, // default 25km radius
            serviceType,
            sortBy = 'distance'
        } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        let query = { status: 'approved', isAvailable: true };

        // Filter by service type if provided
        if (serviceType) {
            query.serviceType = serviceType;
        }

        // Location-based filtering using geospatial query
        const locationQuery = {
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [
                        [parseFloat(longitude), parseFloat(latitude)],
                        parseFloat(radius) / 6371 // convert km to radians
                    ]
                }
            }
        };

        const finalQuery = { ...query, ...locationQuery };

        const providers = await Provider.find(finalQuery)
            .populate('user', 'name email phone')
            .lean();

        // Calculate distance for each provider and sort
        const providersWithDistance = providers.map(provider => {
            const distance = geolib.getDistance(
                { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
                {
                    latitude: provider.location.coordinates.coordinates[1],
                    longitude: provider.location.coordinates.coordinates[0]
                }
            );
            return { ...provider, distance };
        });

        // Sort by distance or rating
        if (sortBy === 'distance') {
            providersWithDistance.sort((a, b) => a.distance - b.distance);
        } else if (sortBy === 'rating') {
            providersWithDistance.sort((a, b) => (b.rating.averageRating || 0) - (a.rating.averageRating || 0));
        }

        res.json({
            success: true,
            data: {
                providers: providersWithDistance,
                radius,
                userLocation: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
            }
        });
    } catch (error) {
        console.error('Match providers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get nearby users for a provider
// @route   GET /api/providers/:id/nearby-users
// @access  Private (Provider owner or Admin)
router.get('/:id/nearby-users', protect, async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        // Check permissions
        const isOwner = provider.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view nearby users'
            });
        }

        const { radius = 25 } = req.query;

        // Import User model (handle multi-collection)
        const { User, Admin, VendorUser } = require('../models/User');

        // Find users near this provider's location
        // Note: User model doesn't have geospatial indexing by default, so we'll do manual distance calculation
        const allUsers = await User.find().lean();
        const adminUsers = await Admin.find().lean();
        const vendorUsers = await VendorUser.find().lean();

        const users = [...allUsers, ...adminUsers, ...vendorUsers];

        const nearbyUsers = users
            .filter(user => {
                // Filter only regular users, not vendors or admins booking
                return user.role === 'user';
            })
            .map(user => {
                // You would calculate distance here if users had location data
                // For now, this returns all users with role 'user'
                return user;
            })
            .slice(0, 50); // Limit to 50 users

        res.json({
            success: true,
            data: {
                provider: {
                    id: provider._id,
                    businessName: provider.businessName,
                    location: provider.location
                },
                nearbyUsers: nearbyUsers,
                totalNearby: nearbyUsers.length
            }
        });
    } catch (error) {
        console.error('Get nearby users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;