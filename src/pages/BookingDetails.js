// Booking Details - Display detailed information about a specific booking
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import './Auth.css';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getBookingById(bookingId);
      
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to load booking details');
      setTimeout(() => navigate('/bookings'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return; // User clicked cancel

    try {
      setIsCancelling(true);
      const response = await carService.cancelBooking(bookingId, reason);
      
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookingDetails(); // Refresh details
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'Confirmed': return '#0066cc';
      case 'Completed': return '#28a745';
      case 'Cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#ffa500';
      case 'Completed': return '#28a745';
      case 'Failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Booking not found</h1>
          <p>Unable to load booking details.</p>
          <Link to="/bookings" className="btn btn-primary">Back to Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card" style={{ maxWidth: '1000px' }}>
        <Link to="/bookings" className="back-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Bookings
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Booking Details</h1>
            <p style={{ color: '#6c757d', margin: 0 }}>Booking ID: {booking._id}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: getStatusColor(booking.status),
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}>
              {booking.status}
            </span>
            <span style={{
              background: getPaymentStatusColor(booking.paymentStatus),
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}>
              Payment: {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Car Information */}
        {booking.carId && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '2px solid #e0e0e0',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Car Details</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {booking.carId.images?.[0] && (
                <img 
                  src={booking.carId.images[0].startsWith('http') 
                    ? booking.carId.images[0] 
                    : `http://localhost:5000${booking.carId.images[0]}`}
                  alt={booking.carId.name}
                  style={{
                    width: '250px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    border: '2px solid #e0e0e0',
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#0066cc' }}>
                  {booking.carId.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Brand</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{booking.carId.brand}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Model</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{booking.carId.model}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Rent Per Day</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#0066cc' }}>
                      {formatCurrency(booking.rentPerDay)}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/cars/${booking.carId._id}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: '#0066cc',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                  }}
                >
                  View Car Details
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Rental Period */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '2px solid #e0e0e0',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333' }}>Rental Period</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '2px solid #28a745',
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#28a745', fontSize: '1rem' }}>🚗 Pickup</h4>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {formatDate(booking.pickupDate)}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                ⏰ Time: <strong>{booking.pickupTime}</strong>
              </p>
              <p style={{ margin: 0, color: '#6c757d' }}>
                📍 Location: <strong>{booking.pickupLocation}</strong>
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '2px solid #dc3545',
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#dc3545', fontSize: '1rem' }}>🏁 Dropoff</h4>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {formatDate(booking.dropoffDate)}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                ⏰ Time: <strong>{booking.dropoffTime}</strong>
              </p>
              <p style={{ margin: 0, color: '#6c757d' }}>
                📍 Location: <strong>{booking.dropoffLocation}</strong>
              </p>
            </div>
          </div>

          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'white', 
            borderRadius: '0.5rem',
            textAlign: 'center',
            border: '2px dashed #0066cc',
          }}>
            <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Total Duration: </span>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#0066cc' }}>
              {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '2px solid #0066cc',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>💰 Pricing Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#6c757d' }}>Rent per day:</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(booking.rentPerDay)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#6c757d' }}>Number of days:</span>
              <span style={{ fontWeight: 'bold' }}>{booking.numberOfDays}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#6c757d' }}>Subtotal ({formatCurrency(booking.rentPerDay)} × {booking.numberOfDays}):</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(booking.totalRent)}</span>
            </div>
            {booking.insuranceSelected && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: '#28a745' }}>✓ Insurance Coverage (10%):</span>
                <span style={{ fontWeight: 'bold', color: '#28a745' }}>{formatCurrency(booking.insuranceCost || 0)}</span>
              </div>
            )}
            {booking.additionalCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: '#6c757d' }}>Additional Charges:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(booking.additionalCharges)}</span>
              </div>
            )}
            <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.25rem' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>Total Amount:</span>
              <span style={{ fontWeight: 'bold', color: '#0066cc' }}>
                {formatCurrency(booking.totalRent + (booking.insuranceCost || 0) + (booking.additionalCharges || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '2px solid #e0e0e0',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>💳 Payment Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Payment Status</p>
              <p style={{ margin: 0, fontWeight: 'bold', color: getPaymentStatusColor(booking.paymentStatus) }}>
                {booking.paymentStatus}
              </p>
            </div>
            {booking.paymentMethod && (
              <div>
                <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Payment Method</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{booking.paymentMethod}</p>
              </div>
            )}
          </div>
        </div>

        {/* Special Requirements */}
        {booking.specialRequirements && (
          <div style={{
            background: '#fff3cd',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '2px solid #ffc107',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#856404' }}>📝 Special Requirements</h3>
            <p style={{ margin: 0, color: '#856404' }}>{booking.specialRequirements}</p>
          </div>
        )}

        {/* Cancellation Info */}
        {booking.status === 'Cancelled' && (
          <div style={{
            background: '#f8d7da',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '2px solid #dc3545',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#721c24' }}>❌ Cancellation Information</h3>
            {booking.cancelledAt && (
              <p style={{ margin: '0 0 0.5rem 0', color: '#721c24' }}>
                <strong>Cancelled on:</strong> {formatDate(booking.cancelledAt)}
              </p>
            )}
            {booking.cancellationReason && (
              <p style={{ margin: 0, color: '#721c24' }}>
                <strong>Reason:</strong> {booking.cancellationReason}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Link 
            to="/bookings"
            className="btn"
            style={{
              background: '#6c757d',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Back to All Bookings
          </Link>

          {booking.status === 'Pending' && (
            <button
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="btn"
              style={{
                background: '#dc3545',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: isCancelling ? 'not-allowed' : 'pointer',
                opacity: isCancelling ? 0.6 : 1,
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}

          {booking.status === 'Confirmed' && booking.paymentStatus === 'Pending' && (
            <Link
              to={`/payment/${bookingId}`}
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Proceed to Payment
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
