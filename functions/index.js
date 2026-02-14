const functions = require('firebase-functions');
const admin = require('firebase-admin');
const geolib = require('geolib'); // For distance calculations

admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered when a new booking is created in Firestore.
 * This function automatically finds the nearest available provider
 * and assigns them to the booking, simulating an "Instant Booking" system.
 */
exports.scheduledFunction = functions.firestore
    .document('bookings/{bookingId}')
    .onCreate(async (snap, context) => {
        const booking = snap.data();
        const bookingId = context.params.bookingId;

        // 1. Get Booking Details
        const { serviceType, location, userId } = booking;

        console.log(`New Booking Received: ${bookingId} for service: ${serviceType}`);

        try {
            // 2. Query Available Providers for the selected Service Type
            const providersSnapshot = await db.collection('providers')
                .where('serviceType', '==', serviceType)
                .where('status', '==', 'available') // Only available providers
                .get();

            if (providersSnapshot.empty) {
                console.log('No providers found for service:', serviceType);
                await db.collection('bookings').doc(bookingId).update({
                    status: 'cancelled',
                    reason: 'No providers available nearby.'
                });
                return null;
            }

            const availableProviders = providersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // 3. Find the Nearest Provider (Smart Matching Logic)
            // Using simple geolib or Euclidean distance
            let nearestProvider = null;
            let minDistance = Infinity;

            // Assuming location is stored as { latitude: number, longitude: number }
            if (location && location.latitude && location.longitude) {
                availableProviders.forEach(provider => {
                    const distance = geolib.getDistance(
                        { latitude: location.latitude, longitude: location.longitude },
                        { latitude: provider.location.latitude, longitude: provider.location.longitude }
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestProvider = provider;
                    }
                });
            } else {
                // Determine mock/fallback provider if location is missing
                nearestProvider = availableProviders[0];
                minDistance = 500; // Mock distance in meters
            }

            if (!nearestProvider) {
                await db.collection('bookings').doc(bookingId).update({
                    status: 'cancelled',
                    reason: 'No nearby providers found.'
                });
                return null;
            }

            // 4. Calculate ETA (Simulated based on distance)
            // Average speed: 30 km/h -> 500m/min
            // ETA in minutes = (Distance in meters / 500) + 5 min buffer
            const estimatedMinutes = Math.ceil((minDistance / 500) + 5);
            const arrivalTime = new Date();
            arrivalTime.setMinutes(arrivalTime.getMinutes() + estimatedMinutes);

            // 5. Update Booking with Provider Details
            await db.collection('bookings').doc(bookingId).update({
                providerId: nearestProvider.id,
                providerName: nearestProvider.name,
                providerRating: nearestProvider.rating,
                status: 'confirmed',
                estimatedArrivalTime: arrivalTime,
                etaMinutes: estimatedMinutes,
                distanceMeters: minDistance,
                assignedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 6. Update Provider Status to prevent double booking
            // (Optional: Depends on business logic, here we keep them available for simplicity or mark busy)
            // await db.collection('providers').doc(nearestProvider.id).update({ status: 'busy' });

            // 7. Send Notification (Simulated log)
            console.log(`Assigned Provider ${nearestProvider.name} to Booking ${bookingId}. ETA: ${estimatedMinutes} mins.`);

            return null;

        } catch (error) {
            console.error('Error assigning provider:', error);
            return null;
        }
    });

/**
 * Optional: API Endpoint to seed database with mock providers
 * Useful for testing the system.
 */
exports.seedProviders = functions.https.onRequest(async (req, res) => {
    const mockProviders = [
        { name: "John Doe", serviceType: "cleaning", status: "available", rating: 4.8, location: { latitude: 37.7749, longitude: -122.4194 } },
        { name: "Jane Smith", serviceType: "plumbing", status: "available", rating: 4.9, location: { latitude: 37.7849, longitude: -122.4094 } }, // Nearby
        { name: "Mike Repair", serviceType: "appliance", status: "available", rating: 4.5, location: { latitude: 37.7949, longitude: -122.3994 } },
        { name: "Electric Co", serviceType: "electrician", status: "available", rating: 4.7, location: { latitude: 37.7649, longitude: -122.4294 } },
    ];

    const batch = db.batch();
    mockProviders.forEach(provider => {
        const ref = db.collection('providers').doc();
        batch.set(ref, provider);
    });

    await batch.commit();
    res.send("Mock providers seeded successfully!");
});
