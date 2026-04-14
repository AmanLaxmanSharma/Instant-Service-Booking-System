const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Time format validation (HH:MM)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Phone validation regex
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const providerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        unique: true,
        index: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [100, 'Business name cannot exceed 100 characters'],
        minlength: [3, 'Business name must be at least 3 characters long']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        trim: true
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
    services: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true
        },
        description: {
            type: String,
            maxlength: [300, 'Service description cannot exceed 300 characters'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Service price is required'],
            min: [0, 'Price cannot be negative']
        },
        duration: {
            type: Number,
            required: [true, 'Service duration is required'],
            min: [15, 'Minimum service duration is 15 minutes']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    location: {
        address: {
            street: {
                type: String,
                required: [true, 'Street is required']
            },
            city: {
                type: String,
                required: [true, 'City is required'],
                trim: true
            },
            state: {
                type: String,
                required: [true, 'State is required'],
                trim: true
            },
            zipCode: {
                type: String,
                required: [true, 'Zip code is required'],
                trim: true
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
                required: [true, 'Coordinates are required'],
                validate: {
                    validator: function(coords) {
                        return coords && coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90;
                    },
                    message: 'Invalid coordinates'
                }
            }
        }
    },
    contactInfo: {
        phone: {
            type: String,
            validate: {
                validator: function(phone) {
                    return !phone || phoneRegex.test(phone);
                },
                message: 'Please enter a valid phone number'
            }
        },
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
        website: String,
        whatsapp: String
    },
    businessHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
    },
    rating: {
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        },
        ratings: {
            five: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            one: { type: Number, default: 0 }
        }
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected', 'suspended', 'inactive'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending',
        index: true
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    verification: {
        licenseNumber: String,
        licenseExpiry: Date,
        licenseDocument: String,
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedAt: Date
    },
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        expiryDate: Date,
        documentUrl: String
    },
    portfolio: [{
        _id: mongoose.Schema.Types.ObjectId,
        title: {
            type: String,
            required: [true, 'Portfolio title is required'],
            trim: true
        },
        description: {
            type: String,
            maxlength: [300, 'Description cannot exceed 300 characters'],
            trim: true
        },
        imageUrl: {
            type: String,
            required: [true, 'Image URL is required']
        },
        date: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    certifications: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: {
            type: String,
            required: [true, 'Certification name is required'],
            trim: true
        },
        issuer: {
            type: String,
            required: [true, 'Certificate issuer is required'],
            trim: true
        },
        issueDate: {
            type: Date,
            required: [true, 'Issue date is required']
        },
        expiryDate: Date,
        certificateUrl: String,
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    responseTime: {
        type: Number, // in minutes
        default: 60,
        min: [5, 'Response time must be at least 5 minutes'],
        max: [1440, 'Response time cannot exceed 24 hours']
    },
    serviceRadius: {
        type: Number, // in kilometers
        default: 25,
        min: [1, 'Service radius must be at least 1 km'],
        max: [100, 'Service radius cannot exceed 100 km']
    },
    completedBookings: {
        type: Number,
        default: 0,
        min: 0
    },
    cancelledBookings: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarnings: {
        type: Number,
        default: 0,
        min: 0
    },
    bankAccount: {
        holderName: String,
        accountNumber: String,
        routingNumber: String,
        bankName: String,
        isVerified: {
            type: Boolean,
            default: false
        }
    },
    documents: {
        idProof: String,
        idProofVerified: {
            type: Boolean,
            default: false
        },
        backgroundCheck: String,
        backgroundCheckVerified: {
            type: Boolean,
            default: false
        }
    },
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedIn: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
providerSchema.index({ serviceType: 1, status: 1, isAvailable: 1 });
providerSchema.index({ 'location.coordinates': '2dsphere' });
providerSchema.index({ user: 1 });
providerSchema.index({ 'rating.averageRating': -1 });
providerSchema.index({ status: 1, isAvailable: 1 });
providerSchema.index({ createdAt: -1 });

// Virtual for full address
providerSchema.virtual('fullAddress').get(function() {
    if (!this.location || !this.location.address) return '';
    const addr = this.location.address;
    return [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
});

// Virtual for completion rate
providerSchema.virtual('completionRate').get(function() {
    const total = this.completedBookings + this.cancelledBookings;
    if (total === 0) return 0;
    return Math.round((this.completedBookings / total) * 100);
});

// Virtual for active certifications
providerSchema.virtual('activeCertifications').get(function() {
    if (!this.certifications) return [];
    return this.certifications.filter(cert => cert.isActive);
});

// Virtual for active services count
providerSchema.virtual('activeServicesCount').get(function() {
    if (!this.services) return 0;
    return this.services.filter(service => service.isActive).length;
});

// Virtual for all documents verified
providerSchema.virtual('allDocumentsVerified').get(function() {
    return this.verification?.isVerified && this.documents?.idProofVerified && this.documents?.backgroundCheckVerified;
});

// Pre-save middleware
providerSchema.pre('save', async function(next) {
    try {
        // Calculate completion rate and auto-suspend if too many cancellations
        const totalBookings = this.completedBookings + this.cancelledBookings;
        if (totalBookings > 10) {
            const completionRate = this.completedBookings / totalBookings;
            if (completionRate < 0.5) {
                this.status = 'suspended';
            }
        }

        // Remove expired certifications from active status
        if (this.certifications) {
            this.certifications.forEach(cert => {
                if (cert.expiryDate && cert.expiryDate < new Date()) {
                    cert.isActive = false;
                }
            });
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Query helper for available providers
providerSchema.query.available = function() {
    return this.where({ isAvailable: true, status: 'approved' });
};

// Query helper for by service type
providerSchema.query.byServiceType = function(serviceType) {
    return this.where({ serviceType, status: 'approved', isAvailable: true });
};

// Query helper for top rated
providerSchema.query.topRated = function() {
    return this.where({ status: 'approved' }).sort({ 'rating.averageRating': -1 });
};

// Static method to find providers near location
providerSchema.statics.findNear = function(longitude, latitude, maxDistance = 25000) {
    return this.find({
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance * 1000 // convert km to meters
            }
        },
        status: 'approved',
        isAvailable: true
    });
};

// Static method to find top providers by service type
providerSchema.statics.findTopByService = function(serviceType, limit = 10) {
    return this.find({ serviceType, status: 'approved', isAvailable: true })
        .sort({ 'rating.averageRating': -1 })
        .limit(limit);
};

// Method to add a service
providerSchema.methods.addService = function(service) {
    this.services.push({
        _id: new mongoose.Types.ObjectId(),
        ...service
    });
    return this.save();
};

// Method to update a service
providerSchema.methods.updateService = function(serviceId, updates) {
    const service = this.services.id(serviceId);
    if (!service) throw new Error('Service not found');
    Object.assign(service, updates);
    return this.save();
};

// Method to delete a service
providerSchema.methods.deleteService = function(serviceId) {
    const service = this.services.id(serviceId);
    if (!service) throw new Error('Service not found');
    service.deleteOne();
    return this.save();
};

// Method to update rating
providerSchema.methods.updateRating = function(newRating) {
    const ratings = this.rating.ratings;
    const ratingKeyMap = { 5: 'five', 4: 'four', 3: 'three', 2: 'two', 1: 'one' };
    
    ratings[ratingKeyMap[newRating]]++;
    this.rating.totalReviews++;
    
    // Recalculate average
    const sum = (5 * ratings.five) + (4 * ratings.four) + (3 * ratings.three) + (2 * ratings.two) + (1 * ratings.one);
    this.rating.averageRating = Math.round((sum / this.rating.totalReviews) * 10) / 10;
    
    return this.save();
};

module.exports = mongoose.model('Provider', providerSchema.plugin(mongoosePaginate));