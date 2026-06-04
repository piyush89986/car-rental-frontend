// Car and Booking Service - API calls for car and booking operations
import api from './api';

const carService = {
  // ==================== CAR OPERATIONS ====================
  
  // Get all cars with filters
  getAllCars: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.fuelType) params.append('fuelType', filters.fuelType);
      if (filters.seatingCapacity) params.append('seatingCapacity', filters.seatingCapacity);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/cars?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get cars error:', error);
      throw error;
    }
  },

  // Get car by ID
  getCarById: async (carId) => {
    try {
      if (!carId) {
        throw new Error('Car ID is required');
      }
      const response = await api.get(`/cars/${carId}`);
      // Backend returns { success, message, car } - not { data }
      return {
        success: response.data.success,
        data: response.data.car || response.data.data,
      };
    } catch (error) {
      console.error('Get car by ID error:', error);
      throw error;
    }
  },

  // Add new car (Admin only)
  addCar: async (carData, images) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(carData).forEach(key => {
        if (key === 'features') {
          formData.append(key, JSON.stringify(carData[key]));
        } else {
          formData.append(key, carData[key]);
        }
      });

      // Add images
      if (images && images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await api.post('/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Add car error:', error);
      throw error;
    }
  },

  // Update car (Admin only)
  updateCar: async (carId, carData, newImages = []) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(carData).forEach(key => {
        if (key === 'features') {
          formData.append(key, JSON.stringify(carData[key]));
        } else {
          formData.append(key, carData[key]);
        }
      });

      // Add new images
      if (newImages && newImages.length > 0) {
        newImages.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await api.put(`/cars/${carId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Update car error:', error);
      throw error;
    }
  },

  // Delete car (Admin only)
  deleteCar: async (carId) => {
    try {
      if (!carId) {
        throw new Error('Car ID is required');
      }
      const response = await api.delete(`/cars/${carId}`);
      return response.data;
    } catch (error) {
      console.error('Delete car error:', error);
      throw error;
    }
  },

  // Delete car image (Admin only)
  deleteCarImage: async (carId, imageUrl) => {
    try {
      if (!carId || !imageUrl) {
        throw new Error('Car ID and image URL are required');
      }
      const response = await api.delete(`/cars/${carId}/image`, {
        data: { imageUrl },
      });
      return response.data;
    } catch (error) {
      console.error('Delete car image error:', error);
      throw error;
    }
  },

  // ==================== BOOKING OPERATIONS ====================
  
  // Check car availability for specific dates
  checkAvailability: async (carId, pickupDate, dropoffDate) => {
    try {
      if (!carId || !pickupDate || !dropoffDate) {
        throw new Error('Car ID, pickup date, and dropoff date are required');
      }

      const params = new URLSearchParams({
        carId,
        pickupDate,
        dropoffDate,
      });
      
      const response = await api.get(`/bookings/check-availability?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Check availability error:', error);
      throw error;
    }
  },

  // Create new booking
  createBooking: async (bookingData) => {
    try {
      // Validate required fields
      const requiredFields = [
        'carId',
        'pickupDate',
        'dropoffDate',
        'pickupTime',
        'dropoffTime',
        'pickupLocation',
        'dropoffLocation'
      ];

      const missingFields = requiredFields.filter(field => !bookingData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate dates
      const pickup = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
      const dropoff = new Date(`${bookingData.dropoffDate}T${bookingData.dropoffTime}`);
      const now = new Date();

      if (pickup < now) {
        throw new Error('Pickup date cannot be in the past');
      }

      if (dropoff <= pickup) {
        throw new Error('Dropoff date/time must be after pickup date/time');
      }

      // Prepare booking data
      const formattedBookingData = {
        carId: bookingData.carId,
        pickupDate: bookingData.pickupDate,
        dropoffDate: bookingData.dropoffDate,
        pickupTime: bookingData.pickupTime,
        dropoffTime: bookingData.dropoffTime,
        pickupLocation: bookingData.pickupLocation.trim(),
        dropoffLocation: bookingData.dropoffLocation.trim(),
        specialRequirements: bookingData.specialRequirements?.trim() || '',
        insuranceSelected: bookingData.insuranceSelected || false,
        paymentMethod: bookingData.paymentMethod || 'Credit Card', // Default payment method
      };

      const response = await api.post('/bookings', formattedBookingData);
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  },

  // Get all bookings for current user
  getMyBookings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/bookings/my?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get my bookings error:', error);
      throw error;
    }
  },

  // Get booking details by ID
  getBookingById: async (bookingId) => {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      const response = await api.get(`/bookings/${bookingId}`);
      // Backend returns { success, message, booking } - normalize to { success, data }
      return {
        success: response.data.success,
        data: response.data.booking || response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      
      const response = await api.put(`/bookings/${bookingId}/cancel`, { 
        cancellationReason: reason.trim() 
      });
      return response.data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  },

  // Update booking payment status
  updatePaymentStatus: async (bookingId, paymentData) => {
    try {
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }
      
      const response = await api.put(`/bookings/${bookingId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  },

  // Calculate booking cost
  calculateBookingCost: (rentPerDay, pickupDate, dropoffDate, insuranceSelected = false) => {
    try {
      const pickup = new Date(pickupDate);
      const dropoff = new Date(dropoffDate);
      
      // Calculate days
      const timeDiff = dropoff - pickup;
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const numberOfDays = days > 0 ? days : 1;

      // Calculate costs
      const totalRent = rentPerDay * numberOfDays;
      const insuranceCost = insuranceSelected ? Math.ceil(totalRent * 0.1) : 0;
      const totalCost = totalRent + insuranceCost;

      return {
        numberOfDays,
        rentPerDay,
        totalRent,
        insuranceCost,
        totalCost,
      };
    } catch (error) {
      console.error('Calculate booking cost error:', error);
      return {
        numberOfDays: 1,
        rentPerDay: rentPerDay || 0,
        totalRent: rentPerDay || 0,
        insuranceCost: 0,
        totalCost: rentPerDay || 0,
      };
    }
  },
};

export default carService;
