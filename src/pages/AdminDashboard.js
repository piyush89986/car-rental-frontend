// Admin Dashboard - Overview and statistics
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import authService from '../services/authService';
import { formatCurrency } from '../utils/helpers';
import './Home.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch cars
      const carsResponse = await carService.getAllCars({ limit: 1000 });
      const totalCars = carsResponse.data?.length || 0;

      // Fetch bookings
      const bookingsResponse = await carService.getMyBookings({ limit: 1000 });
      const bookings = bookingsResponse.data || [];
      
      const totalBookings = bookings.length;
      const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
      
      // Calculate revenue from completed bookings
      const revenue = bookings
        .filter(b => b.paymentStatus === 'Completed')
        .reduce((sum, b) => sum + (b.totalRent + (b.insuranceCost || 0) + (b.additionalCharges || 0)), 0);

      setStats({
        totalCars,
        totalBookings,
        pendingBookings,
        revenue,
      });

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Cars</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalCars}</p>
          <Link to="/admin/cars" style={{ color: 'white', fontSize: '0.9rem', textDecoration: 'underline' }}>
            Manage Cars →
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Bookings</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalBookings}</p>
          <Link to="/admin/bookings" style={{ color: 'white', fontSize: '0.9rem', textDecoration: 'underline' }}>
            View All →
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffa500 0%, #cc8400 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Pending Bookings</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.pendingBookings}</p>
          <Link to="/admin/bookings" style={{ color: 'white', fontSize: '0.9rem', textDecoration: 'underline' }}>
            Manage →
          </Link>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>Total Revenue</h3>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{formatCurrency(stats.revenue)}</p>
          <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>From completed bookings</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/cars"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}
          >
            🚗 Manage Cars
          </Link>
          <Link
            to="/admin/bookings"
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}
          >
            📋 Manage Bookings
          </Link>
          <Link
            to="/"
            className="btn"
            style={{ padding: '0.75rem 1.5rem', textDecoration: 'none', background: '#6c757d', color: 'white' }}
          >
            🌐 View Site
          </Link>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="btn"
            style={{ padding: '0.75rem 1.5rem', background: '#17a2b8', color: 'white' }}
          >
            🔒 {showPasswordForm ? 'Hide' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <div style={{
          marginBottom: '2rem',
          background: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '600px',
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Change Password</h2>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333',
              }}>
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333',
              }}>
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Minimum 6 characters
              </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#333',
              }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 2rem',
                  opacity: isChangingPassword ? 0.6 : 1,
                  cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                }}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="btn"
                style={{
                  padding: '0.75rem 2rem',
                  background: '#6c757d',
                  color: 'white',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div style={{
            background: '#f8f9fa',
            padding: '2rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
          }}>
            <p style={{ color: '#6c757d', margin: 0 }}>No bookings yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
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
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Car</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Pickup Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem' }}>
                      {booking.carId?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {booking.customerId?.firstName || 'N/A'} {booking.customerId?.lastName || ''}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {formatDate(booking.pickupDate)}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      {formatCurrency(booking.totalRent + (booking.insuranceCost || 0))}
                    </td>
                    <td style={{ padding: '1rem' }}>
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
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link
                        to={`/bookings/${booking._id}`}
                        style={{
                          color: '#0066cc',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                        }}
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
