const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    } else {
        console.warn('Razorpay keys not configured. Payment features will not work.');
    }
} catch (error) {
    console.error('Failed to initialize Razorpay:', error);
}

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', [
    protect,
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1')
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

        if (!razorpay) {
            return res.status(500).json({
                success: false,
                message: 'Payment service not configured'
            });
        }

        const { bookingId, amount } = req.body;

        // Verify booking exists and belongs to user
        const booking = await Booking.findById(bookingId).populate('customer provider');
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay for this booking'
            });
        }

        // Check if booking is in payable state
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: 'Booking is not in a payable state'
            });
        }

        // Check if already paid
        if (booking.payment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already paid'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paisa (multiply by 100)
            currency: 'INR',
            receipt: `booking_${bookingId}`,
            payment_capture: 1, // Auto capture
            notes: {
                bookingId: bookingId,
                customerId: req.user._id.toString(),
                providerId: booking.provider._id.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        // Update booking with order details
        booking.payment.transactionId = order.id;
        booking.payment.amount = amount;
        booking.payment.currency = 'INR';
        booking.payment.method = 'card'; // Razorpay typically uses cards/UPI
        await booking.save();

        res.json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order'
        });
    }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', [
    protect,
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('bookingId').isMongoId().withMessage('Valid booking ID is required')
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

        if (!razorpay) {
            return res.status(500).json({
                success: false,
                message: 'Payment service not configured'
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        // Verify booking exists and belongs to user
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to verify payment for this booking'
            });
        }

        // Verify payment signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            // Update booking payment status to failed
            booking.payment.status = 'failed';
            await booking.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Update booking payment status
        booking.payment.status = 'paid';
        booking.payment.transactionId = razorpay_payment_id;
        booking.status = 'confirmed'; // Confirm booking after successful payment
        await booking.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                bookingId: booking._id,
                paymentId: razorpay_payment_id,
                status: 'paid'
            }
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
});

// @desc    Get payment status
// @route   GET /api/payments/status/:bookingId
// @access  Private
router.get('/status/:bookingId', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('customer', 'name email')
            .populate('provider', 'businessName');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user is customer or provider
        const isCustomer = booking.customer._id.toString() === req.user._id.toString();
        const isProvider = booking.provider.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view payment status'
            });
        }

        res.json({
            success: true,
            data: {
                bookingId: booking._id,
                payment: booking.payment,
                bookingStatus: booking.status
            }
        });

    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status'
        });
    }
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private (Admin only)
router.post('/refund', [
    require('../middleware/auth').protect,
    require('../middleware/auth').authorize('admin'),
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
    body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
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

        if (!razorpay) {
            return res.status(500).json({
                success: false,
                message: 'Payment service not configured'
            });
        }

        const { bookingId, amount, reason } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.payment.status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not paid'
            });
        }

        // Process refund via Razorpay
        const refundAmount = amount || booking.payment.amount;
        const refund = await razorpay.payments.refund(booking.payment.transactionId, {
            amount: Math.round(refundAmount * 100),
            notes: {
                reason: reason || 'Customer refund'
            }
        });

        // Update booking
        booking.payment.status = 'refunded';
        booking.cancellation.cancelledBy = 'system';
        booking.cancellation.reason = reason || 'Refund processed';
        booking.cancellation.cancelledAt = new Date();
        booking.cancellation.refundAmount = refundAmount;
        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });

    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Refund processing failed'
        });
    }
});

// @desc    Process payment and create booking (Atomic operation)
// @route   POST /api/payments/process
// @access  Private
// Handles: Payment processing + Booking creation
router.post('/process', [
    protect,
    body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('paymentMethod').isIn(['card', 'wallet', 'upi']).withMessage('Invalid payment method')
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

        const { vendorId, serviceType, amount, paymentMethod, scheduledDate, scheduledTime } = req.body;
        const customerId = req.user._id;

        // Validate vendor exists
        const Provider = require('../models/Provider');
        const vendor = await Provider.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Create booking (Backend handles ALL business logic)
        const booking = await Booking.create({
            customer: customerId,
            provider: vendorId,
            serviceType,
            scheduledDate: scheduledDate || new Date(),
            scheduledTime: scheduledTime || new Date().toLocaleTimeString(),
            location: {
                type: 'Point',
                coordinates: [0, 0] // Should be captured from customer location
            },
            payment: {
                amount,
                method: paymentMethod,
                status: 'pending',
                currency: 'INR'
            },
            status: 'pending'
        });

        // Here you would process actual payment (Razorpay, Stripe, etc.)
        // For now, mark as paid (simulate successful payment)
        booking.payment.status = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking created and payment processed successfully',
            data: {
                bookingId: booking._id,
                paymentId: booking.payment.transactionId,
                amount: booking.payment.amount,
                status: 'confirmed'
            }
        });

    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed'
        });
    }
});

module.exports = router;