const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Time format validation (HH:MM)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required'],
        index: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: [true, 'Provider is required'],
        index: true
    },
    serviceType: {
        type: String,
        required: [true, 'Service type is required'],
        enum: {
            values: ['cleaning', 'plumbing', 'electrician', 'appliance', 'carpentry', 'painting', 'gardening', 'pest-control', 'other'],
            message: '{VALUE} is not a valid service type'
        },
        index: true
    },
    serviceDetails: {
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [15, 'Minimum service duration is 15 minutes']
        }
    },
    location: {
        address: {
            street: String,
            city: {
                type: String,
                required: [true, 'City is required']
            },
            state: {
                type: String,
                required: [true, 'State is required']
            },
            zipCode: {
                type: String,
                required: [true, 'Zip code is required']
            },
            country: {
                type: String,
                default: 'USA'
            }
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, 'Coordinates are required']
            }
        }
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required'],
        validate: {
            validator: function(date) {
                return date > new Date();
            },
            message: 'Scheduled date must be in the future'
        },
        index: true
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required'],
        validate: {
            validator: function(time) {
                return timeRegex.test(time);
            },
            message: 'Scheduled time must be in HH:MM format'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending',
        index: true
    },
    payment: {
        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [0, 'Amount cannot be negative']
        },
        currency: {
            type: String,
            default: 'INR',
            enum: ['USD', 'EUR', 'GBP', 'INR']
        },
        method: {
            type: String,
            enum: {
                values: ['card', 'cash', 'bank-transfer', 'digital-wallet', 'upi'],
                message: '{VALUE} is not a valid payment method'
            }
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'paid', 'refunded', 'failed', 'partial'],
                message: '{VALUE} is not a valid payment status'
            },
            default: 'pending',
            index: true
        },
        transactionId: String,
        receipt: String,
        lastFourDigits: String // for card payments
    },
    notes: {
        customer: {
            type: String,
            maxlength: [300, 'Customer notes cannot exceed 300 characters']
        },
        provider: {
            type: String,
            maxlength: [300, 'Provider notes cannot exceed 300 characters']
        },
        admin: {
            type: String,
            maxlength: [300, 'Admin notes cannot exceed 300 characters']
        }
    },
    estimatedArrival: Date,
    actualArrival: Date,
    startedAt: Date,
    completedAt: Date,
    actualDuration: {
        type: Number,
        min: [0, 'Actual duration cannot be negative']
    },
    distance: Number, // distance from provider to customer in meters
    rating: {
        customerRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        customerReview: {
            type: String,
            maxlength: [500, 'Review cannot exceed 500 characters']
        },
        customerRatedAt: Date,
        providerRating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5']
        },
        providerReview: {
            type: String,
            maxlength: [500, 'Review cannot exceed 500 characters']
        },
        providerRatedAt: Date
    },
    cancellation: {
        cancelledBy: {
            type: String,
            enum: ['customer', 'provider', 'system']
        },
        reason: {
            type: String,
            maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
        },
        cancelledAt: Date,
        refundAmount: {
            type: Number,
            min: [0, 'Refund amount cannot be negative']
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'failed']
        }
    },
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'api', 'admin'],
            default: 'web'
        },
        ipAddress: String,
        userAgent: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'location.coordinates': '2dsphere' });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ serviceType: 1, scheduledDate: 1 });

// Virtual for scheduled datetime
bookingSchema.virtual('scheduledDateTime').get(function() {
    if (this.scheduledDate && this.scheduledTime) {
        const [hours, minutes] = this.scheduledTime.split(':').map(Number);
        const dateTime = new Date(this.scheduledDate);
        dateTime.setHours(hours, minutes, 0, 0);
        return dateTime;
    }
    return null;
});

// Virtual for total duration including travel time
bookingSchema.virtual('estimatedTotalDuration').get(function() {
    if (this.serviceDetails && this.serviceDetails.duration) {
        if (this.distance) {
            // Estimate travel time (assuming 30 km/h average speed)
            const travelTime = (this.distance / 1000) / 30 * 60; // in minutes
            return Math.round(this.serviceDetails.duration + travelTime);
        }
        return this.serviceDetails.duration;
    }
    return null;
});

// Virtual for booking time range
bookingSchema.virtual('timeRange').get(function() {
    const dateTime = this.scheduledDateTime;
    if (dateTime && this.serviceDetails && this.serviceDetails.duration) {
        const endTime = new Date(dateTime);
        endTime.setMinutes(endTime.getMinutes() + this.serviceDetails.duration);
        return {
            start: dateTime,
            end: endTime
        };
    }
    return null;
});

// Virtual for is rated by customer
bookingSchema.virtual('isRatedByCustomer').get(function() {
    return !!this.rating?.customerRating;
});

// Virtual for is rated by provider
bookingSchema.virtual('isRatedByProvider').get(function() {
    return !!this.rating?.providerRating;
});

// Virtual for is refundable
bookingSchema.virtual('isRefundable').get(function() {
    if (this.status === 'completed') return false;
    const hoursBeforeScheduled = (this.scheduledDateTime - new Date()) / (1000 * 60 * 60);
    return hoursBeforeScheduled >= 2; // Refundable if cancelled 2+ hours before
});

// Pre-save middleware
bookingSchema.pre('save', async function(next) {
    try {
        // Validate scheduled date is in future
        if (this.isModified('scheduledDate') && this.scheduledDate < new Date()) {
            throw new Error('Scheduled date must be in the future');
        }

        // Set default payment status if not already set
        if (!this.payment?.status) {
            this.payment = this.payment || {};
            this.payment.status = 'pending';
        }

        // Auto-complete booking if no-show time passed
        if (this.status === 'confirmed' && this.scheduledDateTime && this.scheduledDateTime < new Date()) {
            this.status = 'no-show';
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Query helper for active bookings
bookingSchema.query.active = function() {
    return this.where({ status: { $in: ['pending', 'confirmed', 'in-progress'] } });
};

// Query helper for completed bookings
bookingSchema.query.completed = function() {
    return this.where({ status: 'completed' });
};

// Query helper for past bookings
bookingSchema.query.past = function() {
    return this.where({ status: { $in: ['completed', 'cancelled', 'no-show'] } });
};

// Static method to find bookings by customer in date range
bookingSchema.statics.findCustomerBookings = function(customerId, startDate, endDate) {
    return this.find({
        customer: customerId,
        scheduledDate: { $gte: startDate, $lte: endDate }
    });
};

// Static method to find upcoming bookings
bookingSchema.statics.findUpcoming = function(days = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return this.find({
        scheduledDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['pending', 'confirmed'] }
    });
};

// Static method to find unrated bookings
bookingSchema.statics.findUnratedByCustomer = function(customerId) {
    return this.find({
        customer: customerId,
        status: 'completed',
        'rating.customerRating': { $exists: false }
    });
};

module.exports = mongoose.model('Booking', bookingSchema.plugin(mongoosePaginate));