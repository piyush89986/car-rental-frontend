// Booking Service - API calls for booking operations
import api from './api';

const bookingService = {
  // Check car availability
  checkAvailability: async (carId, pickupDate, dropoffDate) => {
    const response = await api.get('/bookings/check-availability', {
      params: { carId, pickupDate, dropoffDate },
    });
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Get all bookings for current user
  getMyBookings: async (status = null, page = 1, limit = 10) => {
    const params = { page, limit };
    if (status) params.status = status;

    const response = await api.get('/bookings/my', { params });
    return response.data;
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId, cancellationReason) => {
    const response = await api.put(`/bookings/${bookingId}/cancel`, {
      cancellationReason,
    });
    return response.data;
  },

  // Admin: Get all bookings
  getAllBookings: async (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.carId) params.carId = filters.carId;
    if (filters.customerId) params.customerId = filters.customerId;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  // Admin: Update booking status
  updateBookingStatus: async (bookingId, status, adminNotes = '') => {
    const response = await api.put(`/admin/bookings/${bookingId}/status`, {
      status,
      adminNotes,
    });
    return response.data;
  },

  // Admin: Update payment status
  updatePaymentStatus: async (bookingId, paymentStatus, paymentMethod) => {
    const response = await api.put(`/admin/bookings/${bookingId}/payment`, {
      paymentStatus,
      paymentMethod,
    });
    return response.data;
  },

  // Admin: Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};

export default bookingService;
