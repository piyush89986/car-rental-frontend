// Booking History - Display user's booking history
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import './Home.css';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, Pending, Confirmed, Completed, Cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getMyBookings();
      
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await carService.cancelBooking(bookingId, 'Customer requested cancellation');
      
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>My Bookings</h1>
        <p style={{ color: '#6c757d' }}>View and manage all your car rental bookings</p>
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        flexWrap: 'wrap',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '1rem',
      }}>
        {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              background: filter === status ? '#0066cc' : '#f8f9fa',
              color: filter === status ? 'white' : '#333',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: filter === status ? 'bold' : 'normal',
              transition: 'all 0.3s ease',
            }}
          >
            {status === 'all' ? 'All Bookings' : status}
            {status !== 'all' && (
              <span style={{ 
                marginLeft: '0.5rem', 
                background: filter === status ? 'rgba(255,255,255,0.3)' : '#dee2e6',
                padding: '0.125rem 0.5rem',
                borderRadius: '1rem',
                fontSize: '0.85rem',
              }}>
                {bookings.filter(b => b.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: '#f8f9fa', 
          borderRadius: '0.5rem',
        }}>
          <h3 style={{ color: '#6c757d' }}>No bookings found</h3>
          <p style={{ color: '#adb5bd', marginBottom: '1.5rem' }}>
            {filter === 'all' 
              ? 'You haven\'t made any bookings yet' 
              : `No ${filter.toLowerCase()} bookings`}
          </p>
          <Link to="/" className="btn btn-primary">
            Browse Cars
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredBookings.map(booking => (
            <div 
              key={booking._id} 
              style={{
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Car Image */}
                {booking.carId?.images?.[0] && (
                  <div style={{ flexShrink: 0 }}>
                    <img 
                      src={booking.carId.images[0].startsWith('http') 
                        ? booking.carId.images[0] 
                        : `http://localhost:5000${booking.carId.images[0]}`}
                      alt={booking.carId.name}
                      style={{
                        width: '200px',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </div>
                )}

                {/* Booking Details */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                      {booking.carId?.name || 'Car Details Not Available'}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: getStatusColor(booking.status),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}>
                        {booking.status}
                      </span>
                      <span style={{
                        background: getPaymentStatusColor(booking.paymentStatus),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}>
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Pickup</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {formatDate(booking.pickupDate)} at {booking.pickupTime}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
                        📍 {booking.pickupLocation}
                      </p>
                    </div>

                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Dropoff</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {formatDate(booking.dropoffDate)} at {booking.dropoffTime}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
                        📍 {booking.dropoffLocation}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Duration</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {booking.numberOfDays} {booking.numberOfDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Total Amount</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#0066cc', fontSize: '1.1rem' }}>
                        {formatCurrency(booking.totalRent + (booking.insuranceCost || 0))}
                      </p>
                    </div>
                    {booking.paymentMethod && (
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Payment Method</p>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                          {booking.paymentMethod}
                        </p>
                      </div>
                    )}
                    {booking.insuranceSelected && (
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: '#6c757d', fontSize: '0.85rem' }}>Insurance</p>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#28a745' }}>
                          ✓ Included ({formatCurrency(booking.insuranceCost)})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link 
                      to={`/bookings/${booking._id}`}
                      style={{
                        padding: '0.5rem 1.5rem',
                        background: '#0066cc',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </Link>
                    
                    {booking.paymentStatus === 'Pending' && booking.status !== 'Cancelled' && (
                      <Link
                        to={`/payment/${booking._id}`}
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: '#28a745',
                          color: 'white',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Pay Now
                      </Link>
                    )}
                    
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        style={{
                          padding: '0.5rem 1.5rem',
                          background: '#dc3545',
                          color: 'white',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
