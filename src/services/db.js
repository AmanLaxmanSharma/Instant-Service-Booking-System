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
