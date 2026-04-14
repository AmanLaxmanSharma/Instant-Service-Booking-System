// Controller: Admin dashboard logic for monitoring and managing app data
import { getAllBookings, getAvailableProviders, updateBookingStatus, setProviderAvailability } from '../models/services/db';

export const getDashboardMetrics = async () => {
  const bookings = await getAllBookings();
  // getAllUsers currently not in db service; if added, include user count too
  const result = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
  };
  return result;
};

export const setBookingStatusByAdmin = async (bookingId, status) => {
  return await updateBookingStatus(bookingId, status);
};

export const toggleProviderStatus = async (providerId, isAvailable) => {
  return await setProviderAvailability(providerId, isAvailable);
};

export const searchProvidersByService = async (serviceType) => {
  return await getAvailableProviders(serviceType);
};