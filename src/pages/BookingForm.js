// Booking Form - Create new car rental booking
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { useAuth } from '../utils/useAuth';
import { formatCurrency } from '../utils/helpers';
import './Auth.css';

const BookingForm = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate minimum dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [formData, setFormData] = useState({
    pickupDate: today.toISOString().split('T')[0],
    dropoffDate: tomorrow.toISOString().split('T')[0],
    pickupTime: '10:00',
    dropoffTime: '10:00',
    pickupLocation: '',
    dropoffLocation: '',
    specialRequirements: '',
    insuranceSelected: false,
    paymentMethod: 'Credit Card',
  });
  
  const [pricing, setPricing] = useState({
    numberOfDays: 1,
    rentPerDay: 0,
    totalRent: 0,
    insuranceCost: 0,
    totalCost: 0,
  });

  // Fetch car details
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setIsLoading(true);
        const response = await carService.getCarById(carId);
        const carData = response.data;
        
        if (!carData) {
          toast.error('Car not found');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        setCar(carData);
        
        // Initialize pricing with car data
        if (carData && carData.rentPerDay) {
          setPricing(prev => ({
            ...prev,
            rentPerDay: carData.rentPerDay,
          }));
        }
      } catch (error) {
        console.error('Fetch car error:', error);
        toast.error(error.response?.data?.message || 'Failed to load car details');
        // Don't navigate away immediately, let user see the error
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    } else {
      toast.error('Invalid car ID');
      navigate('/');
    }
  }, [carId, navigate]);

  // Calculate pricing whenever dates or insurance changes
  useEffect(() => {
    if (car && car.rentPerDay) {
      calculatePricing();
    }
  }, [formData.pickupDate, formData.dropoffDate, formData.insuranceSelected, car]);

  const calculatePricing = () => {
    if (!car || !car.rentPerDay) return;

    const costBreakdown = carService.calculateBookingCost(
      car.rentPerDay,
      formData.pickupDate,
      formData.dropoffDate,
      formData.insuranceSelected
    );

    setPricing(costBreakdown);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!user) {
      toast.error('Please login to book a car');
      navigate('/login');
      return;
    }

    if (!formData.pickupLocation.trim() || !formData.dropoffLocation.trim()) {
      toast.error('Please enter pickup and dropoff locations');
      return;
    }

    try {
      setIsSubmitting(true);

      // Log the data being sent
      console.log('Booking data being sent:', {
        carId: car._id,
        ...formData,
      });

      // Use the service method with built-in validation
      const response = await carService.createBooking({
        carId: car._id,
        ...formData,
      });

      console.log('Booking response:', response);

      if (response.success) {
        toast.success('Booking created successfully! Redirecting to your bookings...');
        setTimeout(() => {
          navigate('/bookings');
        }, 1500);
      }
    } catch (error) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car || !car.rentPerDay) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Car not found</h1>
          <p>Unable to load car details. Please try again.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card" style={{ maxWidth: '900px' }}>
        <Link to={`/cars/${car._id}`} className="back-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Car Details
        </Link>
        
        <h1>Complete Your Booking</h1>
        <p className="auth-subtitle">Fill in the details below to book your car</p>

        {/* Car Summary */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {car.images && car.images.length > 0 && (
              <img
                src={car.images[0].startsWith('http') ? car.images[0] : `http://localhost:5000${car.images[0]}`}
                alt={car.name}
                style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/120x80?text=Car';
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>{car.name}</h3>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
                {car.brand} {car.model} • {car.year} • {car.seatingCapacity} Seater • {car.fuelType}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6c757d' }}>Rent per day</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#0066cc' }}>
                {formatCurrency(car.rentPerDay)}
              </p>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Pickup Details */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Pickup Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="pickupDate">Pickup Date *</label>
                <input
                  type="date"
                  id="pickupDate"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  min={today.toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickupTime">Pickup Time *</label>
                <input
                  type="time"
                  id="pickupTime"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location *</label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                placeholder="Enter pickup address"
                required
              />
            </div>
          </div>

          {/* Dropoff Details */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Dropoff Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="dropoffDate">Dropoff Date *</label>
                <input
                  type="date"
                  id="dropoffDate"
                  name="dropoffDate"
                  value={formData.dropoffDate}
                  onChange={handleChange}
                  min={formData.pickupDate}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dropoffTime">Dropoff Time *</label>
                <input
                  type="time"
                  id="dropoffTime"
                  name="dropoffTime"
                  value={formData.dropoffTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dropoffLocation">Dropoff Location *</label>
              <input
                type="text"
                id="dropoffLocation"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleChange}
                placeholder="Enter dropoff address"
                required
              />
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Additional Options</h3>
            
            <div className="form-group">
              <label htmlFor="specialRequirements">Special Requirements (Optional)</label>
              <textarea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleChange}
                placeholder="Any special requests or requirements..."
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
                background: formData.insuranceSelected ? 'rgba(0, 102, 204, 0.05)' : 'white',
              }}>
                <input
                  type="checkbox"
                  name="insuranceSelected"
                  checked={formData.insuranceSelected}
                  onChange={handleChange}
                  style={{ width: 'auto', margin: 0 }}
                />
                <span style={{ flex: 1 }}>
                  <strong>Add Insurance Coverage</strong>
                  <br />
                  <small style={{ color: '#6c757d' }}>
                    Comprehensive coverage for peace of mind (10% of rental cost)
                  </small>
                </span>
                {formData.insuranceSelected && (
                  <span style={{ color: '#0066cc', fontWeight: 'bold' }}>
                    +{formatCurrency(pricing.insuranceCost)}
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Payment Method</h3>
            <div className="form-group">
              <label htmlFor="paymentMethod">Select Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '0.5rem',
                  width: '100%',
                  cursor: 'pointer',
                  background: 'white',
                }}
              >
                <option value="Credit Card">💳 Credit Card</option>
                <option value="Debit Card">💳 Debit Card</option>
                <option value="UPI">📱 UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Net Banking">🏦 Net Banking</option>
                <option value="Cash on Delivery">💵 Cash on Delivery</option>
                <option value="Digital Wallet">📲 Digital Wallet (PayPal, etc.)</option>
              </select>
              <small style={{ color: '#6c757d', marginTop: '0.5rem', display: 'block' }}>
                Choose your preferred payment method. Payment will be processed after booking confirmation.
              </small>
            </div>
          </div>

          {/* Pricing Summary */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '2px solid #e0e0e0',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Booking Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Number of Days:</span>
                <span style={{ fontWeight: 'bold' }}>{pricing.numberOfDays} {pricing.numberOfDays === 1 ? 'day' : 'days'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6c757d' }}>Rent ({formatCurrency(pricing.rentPerDay)} × {pricing.numberOfDays}):</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(pricing.totalRent)}</span>
              </div>
              {formData.insuranceSelected && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6c757d' }}>Insurance (10%):</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(pricing.insuranceCost)}</span>
                </div>
              )}
              <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>Total Amount:</span>
                <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{formatCurrency(pricing.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
            style={{ fontSize: '1.1rem', padding: '0.875rem' }}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>

          <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '0.85rem', margin: '0' }}>
            By confirming, you agree to our terms and conditions
          </p>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
