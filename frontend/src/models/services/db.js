// Model: Database service functions for CRUD operations on services, bookings, and users
import { db, auth } from '../lib/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

/**
 * Creates a new booking request in Firestore.
 * This will trigger the backend Cloud Function to process the request.
 * 
 * @param {Object} bookingDetails 
 * @param {string} bookingDetails.serviceType - The type of service (e.g., 'cleaning')
 * @param {Object} bookingDetails.location - User's location { latitude: number, longitude: number }
 * @param {string} bookingDetails.userId - The ID of the authenticated user
 * @returns {Promise<string>} The ID of the newly created booking document.
 */
export const createBooking = async (bookingDetails) => {
    try {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...bookingDetails,
            status: 'pending', // Initial status
            timestamp: serverTimestamp(), // Firebase server time
            estimatedArrivalTime: null,
            providerId: null
        });
        console.log("Booking created with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding booking: ", e);
        throw e;
    }
};

/**
 * Listens for real-time updates on a specific booking.
 * Use this to update the UI when the status changes from 'pending' to 'confirmed'.
 * 
 * @param {string} bookingId 
 * @param {Function} callback - Function to call with the updated booking data
 * @returns {Function} Unsubscribe function to stop listening
 */
export const listenToBooking = (bookingId, callback) => {
    const unsub = onSnapshot(doc(db, "bookings", bookingId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            console.log("No such booking!"); // Could happen if deleted
            callback(null);
        }
    });
    return unsub; // Call this function to stop listening when component unmounts
};

/**
 * Fetches available providers for a given service type.
 * Useful for showing a "Nearby Providers" list on the UI.
 * 
 * @param {string} serviceType 
 * @returns {Promise<Array>} List of providers
 */
export const getAvailableProviders = async (serviceType) => {
    try {
        const q = query(
            collection(db, "providers"),
            where("serviceType", "==", serviceType),
            where("status", "==", "available")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching providers: ", e);
        return [];
    }
};

/**
 * Creates a new user profile in the 'users' collection after authentication.
 * 
 * @param {string} uid 
 * @param {Object} userData - { email, displayName, phone, etc. }
 */
export const createUserProfile = async (uid, userData) => {
    try {
        await updateDoc(doc(db, "users", uid), {
            ...userData,
            updatedAt: serverTimestamp()
        }, { merge: true }); // Only update provided fields
    } catch (e) {
        console.error("Error creating user profile: ", e);
    }
};

export const getAllBookings = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Error fetching all bookings: ', e);
        return [];
    }
};

export const getUserBookings = async (userId) => {
    try {
        const q = query(collection(db, 'bookings'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Error fetching user bookings: ', e);
        return [];
    }
};

export const getVendorBookings = async (vendorId) => {
    try {
        const q = query(collection(db, 'bookings'), where('providerId', '==', vendorId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Error fetching vendor bookings: ', e);
        return [];
    }
};

export const updateBookingStatus = async (bookingId, status) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), { status, updatedAt: serverTimestamp() });
    } catch (e) {
        console.error('Error updating booking status: ', e);
        throw e;
    }
};

export const setProviderAvailability = async (providerId, available) => {
    try {
        await updateDoc(doc(db, 'providers', providerId), { status: available ? 'available' : 'unavailable', updatedAt: serverTimestamp() });
    } catch (e) {
        console.error('Error updating provider availability: ', e);
        throw e;
    }
};

/**
 * Creates a new provider profile in the 'providers' collection.
 * 
 * @param {Object} providerData - { userId, name, phone, services, price, etc. }
 * @returns {Promise<string>} The ID of the newly created provider document.
 */
export const createProvider = async (providerData) => {
    try {
        const docRef = await addDoc(collection(db, 'providers'), {
            ...providerData,
            status: 'unavailable', // Initially unavailable until they go live
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log("Provider created with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error creating provider: ", e);
        throw e;
    }
};

/**
 * Gets provider profile by userId.
 * 
 * @param {string} userId
 * @returns {Promise<Object|null>} Provider data or null if not found
 */
export const getProviderByUserId = async (userId) => {
    try {
        const q = query(collection(db, 'providers'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (e) {
        console.error('Error fetching provider: ', e);
        return null;
    }
};

/**
 * Updates provider profile.
 * 
 * @param {string} providerId
 * @param {Object} updateData
 */
export const updateProvider = async (providerId, updateData) => {
    try {
        await updateDoc(doc(db, 'providers', providerId), {
            ...updateData,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error('Error updating provider: ', e);
        throw e;
    }
};

