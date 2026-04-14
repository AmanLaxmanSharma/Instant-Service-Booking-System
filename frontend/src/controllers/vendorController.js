// Controller: Vendor-specific actions and vendor dashboard logic
import { getVendorBookings, updateBookingStatus, setProviderAvailability } from '../models/services/db';

export const getAssignedBookings = async (vendorId) => {
  return await getVendorBookings(vendorId);
};

export const updateBooking = async (bookingId, newStatus) => {
  return await updateBookingStatus(bookingId, newStatus);
};

export const setAvailability = async (vendorId, isAvailable) => {
  return await setProviderAvailability(vendorId, isAvailable);
};

export const acceptBooking = async (bookingId) => {
  return await updateBookingStatus(bookingId, 'confirmed');
};

export const completeBooking = async (bookingId) => {
  return await updateBookingStatus(bookingId, 'completed');
};