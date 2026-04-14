// Model: Database service functions for CRUD operations using backend API
import {
    createBooking as apiCreateBooking,
    getBookings as apiGetBookings,
    getBooking as apiGetBooking,
    getProviders as apiGetProviders,
    getProvider as apiGetProvider,
    updateBookingStatus as apiUpdateBookingStatus,
    cancelBooking as apiCancelBooking,
    getVendorProfile as apiGetVendorProfile,
    updateVendorProfile as apiUpdateVendorProfile,
    setProviderAvailability as apiSetProviderAvailability,
    createProvider as apiCreateProvider,
    processPayment as apiProcessPayment
} from './api';

/**
 * Creates a new booking request in the backend.
 * 
 * @param {Object} bookingDetails 
 * @param {string} bookingDetails.serviceType - The type of service (e.g., 'cleaning')
 * @param {Object} bookingDetails.location - User's location
 * @param {string} bookingDetails.providerId - The ID of the provider
 * @param {string} bookingDetails.scheduledDate - Date for the booking
 * @param {string} bookingDetails.scheduledTime - Time for the booking
 * @returns {Promise<string>} The ID of the newly created booking document.
 */
export const createBooking = async (bookingDetails) => {
    try {
        const response = await apiCreateBooking(bookingDetails);
        console.log("Booking created with ID: ", response.data._id);
        return response.data._id;
    } catch (error) {
        console.error("Error adding booking: ", error);
        throw error;
    }
};

/**
 * Fetches bookings for the current user with real-time updates capability.
 * 
 * @param {Object} filters - Filter options { page, limit, status, serviceType }
 * @returns {Promise<Object>} Bookings data with pagination
 */
export const getBookingsList = async (filters = {}) => {
    try {
        const response = await apiGetBookings(filters);
        return response.data;
    } catch (error) {
        console.error("Error fetching bookings: ", error);
        return { bookings: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
};

/**
 * Alias for getBookingsList for user bookings
 */
export const getUserBookings = async (userId) => {
    try {
        const response = await apiGetBookings();
        return response.data.bookings;
    } catch (error) {
        console.error("Error fetching user bookings: ", error);
        return [];
    }
};

/**
 * Alias for getBookingsList for vendor bookings
 */
export const getVendorBookings = async (vendorId) => {
    try {
        const response = await apiGetBookings();
        return response.data.bookings;
    } catch (error) {
        console.error("Error fetching vendor bookings: ", error);
        return [];
    }
};

/**
 * Get all bookings (admin function)
 */
export const getAllBookings = async () => {
    try {
        const response = await apiGetBookings({ limit: 1000 });
        return response.data.bookings;
    } catch (error) {
        console.error("Error fetching all bookings: ", error);
        return [];
    }
};

/**
 * Fetches a specific booking by ID.
 * 
 * @param {string} bookingId 
 * @returns {Promise<Object>} Booking data
 */
export const fetchBooking = async (bookingId) => {
    try {
        const response = await apiGetBooking(bookingId);
        return response.data.booking;
    } catch (error) {
        console.error("Error fetching booking: ", error);
        return null;
    }
};

/**
 * Updates a booking status.
 * 
 * @param {string} bookingId 
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated booking data
 */
export const updateBookingStatus = async (bookingId, status) => {
    try {
        const response = await apiUpdateBookingStatus(bookingId, status);
        return response.data;
    } catch (error) {
        console.error("Error updating booking status: ", error);
        throw error;
    }
};

/**
 * Cancels a booking.
 * 
 * @param {string} bookingId 
 * @returns {Promise<Object>} Response data
 */
export const cancelBookingRequest = async (bookingId) => {
    try {
        const response = await apiCancelBooking(bookingId);
        return response.data;
    } catch (error) {
        console.error("Error cancelling booking: ", error);
        throw error;
    }
};

/**
 * Fetches available providers for a given service type or location.
 * 
 * @param {Object} filters - Filter options { serviceType, latitude, longitude, radius, page, limit }
 * @returns {Promise<Array>} List of providers
 */
export const getAvailableProviders = async (filters = {}) => {
    try {
        const response = await apiGetProviders(filters);
        return response.data.providers;
    } catch (error) {
        console.error("Error fetching providers: ", error);
        return [];
    }
};

/**
 * Fetches a specific provider by ID.
 * 
 * @param {string} providerId 
 * @returns {Promise<Object>} Provider data
 */
export const fetchProvider = async (providerId) => {
    try {
        const response = await apiGetProvider(providerId);
        return response.data.provider;
    } catch (error) {
        console.error("Error fetching provider: ", error);
        return null;
    }
};

/**
 * Fetches the current vendor's profile.
 * 
 * @returns {Promise<Object>} Vendor profile data
 */
export const getVendorProfile = async () => {
    try {
        const response = await apiGetVendorProfile();
        return response.data;
    } catch (error) {
        console.error("Error fetching vendor profile: ", error);
        return null;
    }
};

/**
 * Updates the current vendor's profile.
 * 
 * @param {Object} profileData - Profile information to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateVendorProfileData = async (profileData) => {
    try {
        const response = await apiUpdateVendorProfile(profileData);
        return response.data;
    } catch (error) {
        console.error("Error updating vendor profile: ", error);
        throw error;
    }
};

/**
 * Sets provider availability status
 * 
 * @param {string} providerId - Provider ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<Object>} Updated provider data
 */
export const setProviderAvailability = async (providerId, isAvailable) => {
    try {
        const response = await apiSetProviderAvailability(providerId, isAvailable);
        return response.data;
    } catch (error) {
        console.error("Error setting provider availability: ", error);
        throw error;
    }
};

/**
 * Gets provider profile for a user.
 * Calls the API to get the current vendor's provider profile.
 * 
 * @param {string} userId - User ID (currently unused, gets current vendor's profile)
 * @returns {Promise<Object|null>} Provider data or null if not found
 */
export const getProviderByUserId = async (userId) => {
    try {
        const response = await apiGetVendorProfile();
        if (response.data && response.data.provider) {
            return {
                id: response.data.provider._id,
                uid: response.data.provider.user,
                ...response.data.provider
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching provider profile: ", error);
        return null;
    }
};

/**
 * Creates a new provider profile.
 * 
 * @param {Object} providerData - Provider information
 * @returns {Promise<Object>} Created provider data
 */
export const createProvider = async (providerData) => {
    try {
        const response = await apiCreateProvider(providerData);
        return response.data || response;
    } catch (error) {
        console.error("Error creating provider: ", error);
        throw error;
    }
};

/**
 * Process payment and create booking (Backend handles both atomically)
 * @param {Object} paymentData - Payment and booking information
 * @returns {Promise<Object>} Created booking data
 */
export const processPaymentAndBooking = async (paymentData) => {
    try {
        const response = await apiProcessPayment(paymentData);
        return response.data;
    } catch (error) {
        console.error("Error processing payment: ", error);
        throw error;
    }
};
