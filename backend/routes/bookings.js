const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const { protect, authorize } = require('../middleware/auth');
const geolib = require('geolib');

const router = express.Router();

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const serviceType = req.query.serviceType;

        let query = {};

        // Filter based on user role
        if (req.user.role === 'vendor') {
            // Vendors see bookings for their services
            const provider = await Provider.findOne({ user: req.user._id });
            if (provider) {
                query.provider = provider._id;
            } else {
                return res.json({
                    success: true,
                    data: {
                        bookings: [],
                        pagination: {
                            page: 1,
                            limit,
                            total: 0,
                            pages: 0
                        }
                    }
                });
            }
        } else {
            // Customers see their own bookings
            query.customer = req.user._id;
        }

        // Additional filters
        if (status) query.status = status;
        if (serviceType) query.serviceType = serviceType;

        const options = {
            page,
            limit,
            sort: { createdAt: -1 },
            populate: [
                { path: 'customer', select: 'name email phone' },
                { path: 'provider', select: 'businessName contactInfo rating' }
            ]
        };

        const result = await Booking.paginate(query, options);

        res.json({
            success: true,
            data: {
                bookings: result.docs,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.totalDocs,
                    pages: result.totalPages
                }
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone address')
            .populate('provider', 'businessName contactInfo location rating services');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user has permission to view this booking
        const isCustomer = booking.customer._id.toString() === req.user._id.toString();
        const isProvider = req.user.role === 'vendor' && booking.provider.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.json({
            success: true,
            data: {
                booking
            }
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', [
    protect,
    body('providerId').isMongoId().withMessage('Valid provider ID is required'),
    body('serviceType').isIn(['cleaning', 'plumbing', 'electrician', 'appliance', 'carpentry', 'painting', 'gardening', 'pest-control', 'other']).withMessage('Valid service type is required'),
    body('serviceDetails').isObject().withMessage('Service details are required'),
    body('location').isObject().withMessage('Location is required'),
    body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
    body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format HH:MM required')
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

        const {
            providerId,
            serviceType,
            serviceDetails,
            location,
            scheduledDate,
            scheduledTime,
            notes
        } = req.body;

        // Verify provider exists and is available
        const provider = await Provider.findById(providerId);
        if (!provider || !provider.isAvailable || provider.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Provider not available'
            });
        }

        // Check if the requested service is offered by the provider
        const serviceOffered = provider.services.find(service =>
            service.name.toLowerCase() === serviceDetails.name.toLowerCase() && service.isActive
        );

        if (!serviceOffered) {
            return res.status(400).json({
                success: false,
                message: 'Service not offered by this provider'
            });
        }

        // Calculate distance if coordinates are provided
        let distance = null;
        if (location.coordinates && provider.location.coordinates) {
            distance = geolib.getDistance(
                location.coordinates,
                provider.location.coordinates
            );
        }

        // Check if location is within provider's service radius
        if (distance && distance / 1000 > provider.serviceRadius) {
            return res.status(400).json({
                success: false,
                message: 'Location is outside provider service area'
            });
        }

        // Calculate estimated arrival time
        const estimatedArrival = new Date(scheduledDate + 'T' + scheduledTime);
        const travelTime = distance ? Math.ceil((distance / 1000) / 30 * 60) : 30; // 30 min default
        estimatedArrival.setMinutes(estimatedArrival.getMinutes() - travelTime);

        // Create booking
        const booking = await Booking.create({
            customer: req.user._id,
            provider: providerId,
            serviceType,
            serviceDetails: {
                ...serviceDetails,
                price: serviceOffered.price,
                duration: serviceOffered.duration
            },
            location,
            scheduledDate,
            scheduledTime,
            payment: {
                amount: serviceOffered.price,
                currency: 'USD'
            },
            notes: {
                customer: notes
            },
            estimatedArrival,
            distance,
            metadata: {
                source: 'web',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        // Populate the booking for response
        await booking.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'provider', select: 'businessName contactInfo rating' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                booking
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during booking creation'
        });
    }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', [
    protect,
    body('status').isIn(['confirmed', 'in-progress', 'completed', 'cancelled']).withMessage('Valid status is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
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

        const { status, notes } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check permissions
        const isCustomer = booking.customer.toString() === req.user._id.toString();
        const isProvider = req.user.role === 'vendor';
        const isAdmin = req.user.role === 'admin';

        // Only allow certain status changes based on user role
        if (status === 'confirmed' && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only providers can confirm bookings'
            });
        }

        if (status === 'completed' && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only providers can mark bookings as completed'
            });
        }

        if (status === 'cancelled' && !isCustomer && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Update booking
        const updateData = { status };

        if (status === 'in-progress' && !booking.startedAt) {
            updateData.startedAt = new Date();
        }

        if (status === 'completed' && !booking.completedAt) {
            updateData.completedAt = new Date();
            if (booking.startedAt) {
                updateData.duration = Math.round((new Date() - booking.startedAt) / (1000 * 60));
            }
        }

        if (notes) {
            if (isProvider) {
                updateData['notes.provider'] = notes;
            } else if (isCustomer) {
                updateData['notes.customer'] = notes;
            } else {
                updateData['notes.admin'] = notes;
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'provider', select: 'businessName contactInfo rating' }
        ]);

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            data: {
                booking: updatedBooking
            }
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', [
    protect,
    body('reason').isString().isLength({ min: 10 }).withMessage('Cancellation reason is required (min 10 characters)')
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

        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled
        if (['completed', 'cancelled', 'in-progress'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking with current status'
            });
        }

        // Check permissions
        const isCustomer = booking.customer.toString() === req.user._id.toString();
        const isProvider = req.user.role === 'vendor';
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Update booking
        const updateData = {
            status: 'cancelled',
            'cancellation.cancelledBy': isCustomer ? 'customer' : (isProvider ? 'provider' : 'admin'),
            'cancellation.reason': reason,
            'cancellation.cancelledAt': new Date()
        };

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'provider', select: 'businessName contactInfo rating' }
        ]);

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                booking: updatedBooking
            }
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;