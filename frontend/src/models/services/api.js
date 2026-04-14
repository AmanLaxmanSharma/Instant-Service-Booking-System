// API Service: Handles all backend API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Store token in localStorage
export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const removeToken = () => {
    localStorage.removeItem('authToken');
};

// Helper function for API requests with authentication
const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// ==================== AUTH API CALLS ====================

/**
 * Register a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} role - User role (user, vendor, admin)
 * @param {string} phone - User's phone number (optional)
 * @returns {Promise<Object>} User data and auth token
 */
export const registerUser = async (name, email, password, role = 'user', phone = '') => {
    return apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, phone }),
    });
};

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and auth token
 */
export const loginUser = async (email, password) => {
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
    return apiCall('/auth/me', {
        method: 'GET',
    });
};

// ==================== BOOKING API CALLS ====================

/**
 * Create a new booking
 * @param {Object} bookingDetails - Booking information
 * @returns {Promise<Object>} Created booking data
 */
export const createBooking = async (bookingDetails) => {
    return apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingDetails),
    });
};

/**
 * Get all bookings for current user
 * @param {Object} filters - Filter options (page, limit, status, serviceType)
 * @returns {Promise<Object>} Bookings and pagination data
 */
export const getBookings = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });
    
    return apiCall(`/bookings?${queryParams.toString()}`, {
        method: 'GET',
    });
};

/**
 * Get a specific booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking data
 */
export const getBooking = async (bookingId) => {
    return apiCall(`/bookings/${bookingId}`, {
        method: 'GET',
    });
};

/**
 * Update booking status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated booking data
 */
export const updateBookingStatus = async (bookingId, status) => {
    return apiCall(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Cancelled booking data
 */
export const cancelBooking = async (bookingId) => {
    return apiCall(`/bookings/${bookingId}`, {
        method: 'DELETE',
    });
};

// ==================== PROVIDER API CALLS ====================

/**
 * Get all available providers
 * @param {Object} filters - Filter options (serviceType, latitude, longitude, radius, page, limit)
 * @returns {Promise<Object>} Providers and pagination data
 */
export const getProviders = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) queryParams.append(key, value);
    });
    
    return apiCall(`/providers?${queryParams.toString()}`, {
        method: 'GET',
    });
};

/**
 * Get a specific provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} Provider data
 */
export const getProvider = async (providerId) => {
    return apiCall(`/providers/${providerId}`, {
        method: 'GET',
    });
};

/**
 * Update vendor profile
 * @param {Object} profileData - Vendor profile information
 * @returns {Promise<Object>} Updated profile data
 */
export const updateVendorProfile = async (profileData) => {
    return apiCall('/providers/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
    });
};

/**
 * Get vendor's own provider profile
 * @returns {Promise<Object>} Vendor's provider profile
 */
export const getVendorProfile = async () => {
    return apiCall('/providers/profile', {
        method: 'GET',
    });
};

/**
 * Create a new provider profile
 * @param {Object} providerData - Provider information
 * @returns {Promise<Object>} Created provider data
 */
export const createProvider = async (providerData) => {
    return apiCall('/providers', {
        method: 'POST',
        body: JSON.stringify(providerData),
    });
};

/**
 * Update provider availability
 * @param {string} providerId - Provider ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise<Object>} Updated provider data
 */
export const setProviderAvailability = async (providerId, isAvailable) => {
    return apiCall(`/providers/${providerId}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable }),
    });
};

// ==================== PAYMENT API CALLS ====================

/**
 * Create a payment intent
 * @param {string} bookingId - Booking ID
 * @param {number} amount - Payment amount
 * @returns {Promise<Object>} Payment intent data
 */
export const createPaymentIntent = async (bookingId, amount) => {
    return apiCall('/payments/intent', {
        method: 'POST',
        body: JSON.stringify({ bookingId, amount }),
    });
};

/**
 * Confirm payment
 * @param {string} paymentId - Payment ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Payment confirmation data
 */
export const confirmPayment = async (paymentId, paymentMethodId) => {
    return apiCall('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentId, paymentMethodId }),
    });
};

/**
 * Process payment and create booking (Backend handles both)
 * @param {Object} paymentData - Payment and booking information
 * @param {string} paymentData.vendorId - Vendor/Provider ID
 * @param {string} paymentData.serviceType - Service type
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.paymentMethod - Payment method (card, wallet, upi)
 * @returns {Promise<Object>} Booking data with confirmation
 */
export const processPayment = async (paymentData) => {
    return apiCall('/payments/process', {
        method: 'POST',
        body: JSON.stringify(paymentData),
    });
};

export default {
    setToken,
    getToken,
    removeToken,
    registerUser,
    loginUser,
    getCurrentUser,
    createBooking,
    getBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking,
    getProviders,
    getProvider,
    createProvider,
    updateVendorProfile,
    getVendorProfile,
    setProviderAvailability,
    createPaymentIntent,
    confirmPayment,
};
