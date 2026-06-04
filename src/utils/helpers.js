// Utility Functions - Helper functions for the frontend
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDays = (pickupDate, dropoffDate) => {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const timeDiff = dropoff - pickup;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

export const calculateTotalRent = (rentPerDay, numberOfDays) => {
  return rentPerDay * numberOfDays;
};

export const calculateTotalCost = (rentPerDay, numberOfDays, insuranceCost = 0, additionalCharges = 0) => {
  const totalRent = calculateTotalRent(rentPerDay, numberOfDays);
  return totalRent + insuranceCost + additionalCharges;
};

export const getStatusBadgeColor = (status) => {
  const statusColors = {
    Pending: '#ffc107',
    Confirmed: '#0066cc',
    Completed: '#28a745',
    Cancelled: '#dc3545',
  };
  return statusColors[status] || '#6c757d';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const isPasswordStrong = (password) => {
  // At least 6 characters
  return password.length >= 6;
};
