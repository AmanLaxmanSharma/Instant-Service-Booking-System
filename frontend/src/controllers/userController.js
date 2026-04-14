// Controller: User action handlers and workflow logic
import { createBooking, getAvailableProviders, getUserBookings, updateBookingStatus } from '../models/services/db';

export const loadServiceProviders = async (serviceType) => {
  // Returns available vendors/providers for service selection
  return await getAvailableProviders(serviceType);
};

export const selectVendor = (serviceId, vendor) => {
  // Temporary client-side selection step
  return {
    serviceId,
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorContact: vendor.phone,
    serviceType: vendor.serviceType,
  };
};

export const requestBooking = async ({ userId, serviceId, vendorId, location, details }) => {
  const booking = {
    userId,
    serviceId,
    providerId: vendorId,
    location,
    details,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  return await createBooking(booking);
};

export const getUserHistory = async (userId) => {
  return await getUserBookings(userId);
};

export const cancelBooking = async (bookingId) => {
  return await updateBookingStatus(bookingId, 'cancelled');
};