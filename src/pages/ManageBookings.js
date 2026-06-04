// Manage Bookings - Admin panel for managing all bookings
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';
import '../styles/index.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '?limit=100';
      const response = await api.get(`/admin/bookings${params}`);
      setBookings(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await api.put(`/admin/bookings/${selectedBooking._id}/status`, {
        status: newStatus,
        adminNotes: adminNotes,
      });
      
      toast.success('Booking status updated successfully');
      setShowStatusModal(false);
      setSelectedBooking(null);
      setNewStatus('');
      setAdminNotes('');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdatePayment = async (bookingId, paymentStatus) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/payment`, {
        paymentStatus,
      });
      
      toast.success('Payment status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Manage Bookings</h1>
        <p style={{ color: '#6c757d' }}>View and manage all customer bookings</p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '0.25rem',
            fontSize: '1rem',
          }}
        >
          <option value="">All Bookings</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div style={{ overflowX: 'auto' }}>
        {bookings.length === 0 ? (
          <div style={{
            background: '#f8f9fa',
            padding: '3rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#6c757d', margin: 0 }}>No bookings found</p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Booking ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Car</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Dates</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Payment</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {booking.bookingReference}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {booking.customerId?.firstName} {booking.customerId?.lastName}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        {booking.customerId?.email}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {booking.carId?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.9rem' }}>
                      <div>{formatDate(booking.pickupDate)}</div>
                      <div style={{ color: '#6c757d' }}>to {formatDate(booking.dropoffDate)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {formatCurrency(booking.totalRent + (booking.insuranceCost || 0) + (booking.additionalCharges || 0))}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: getStatusColor(booking.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={booking.paymentStatus}
                      onChange={(e) => handleUpdatePayment(booking._id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.25rem',
                        fontSize: '0.85rem',
                        background: getPaymentStatusColor(booking.paymentStatus),
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setNewStatus(booking.status);
                          setShowStatusModal(true);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#0066cc',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        Update Status
                      </button>
                      <Link
                        to={`/bookings/${booking._id}`}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          display: 'inline-block',
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Update Booking Status</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Booking: {selectedBooking?.bookingReference}
              </label>
              <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                {selectedBooking?.carId?.name} - {selectedBooking?.customerId?.firstName} {selectedBooking?.customerId?.lastName}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                New Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
                placeholder="Add any notes about this status change..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedBooking(null);
                  setNewStatus('');
                  setAdminNotes('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
