// User Profile - View and edit user profile information
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../utils/useAuth';
import authService from '../services/authService';
import './Auth.css';

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to server
      // const formData = new FormData();
      // formData.append('profilePhoto', file);
      // await authService.uploadProfilePhoto(formData);
      
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      toast.error('Failed to upload profile photo');
      console.error(error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API to update profile
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>My Profile</h1>
          <Link to="/bookings" className="btn" style={{ background: '#6c757d', color: 'white', textDecoration: 'none' }}>
            My Bookings
          </Link>
        </div>

        {/* Profile Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div 
              onClick={handlePhotoClick}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: profilePhoto ? `url(${profilePhoto}) center/cover` : 'white',
                color: '#0066cc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem auto',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid white',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {!profilePhoto && (
                <>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</>
              )}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.6)',
                padding: '0.25rem',
                fontSize: '0.75rem',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                {isUploadingPhoto ? 'Uploading...' : '📷 Edit'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>{user?.firstName} {user?.lastName}</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>{user?.email}</p>
          {user?.role === 'admin' && (
            <div style={{
              display: 'inline-block',
              marginTop: '1rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.9rem',
            }}>
              👑 Administrator
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Personal Information</h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem' }}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn"
                  style={{ padding: '0.5rem 1rem', background: '#6c757d', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                required
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
                Email cannot be changed
              </small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Street address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </form>

        {/* Account Actions */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '2px solid #e0e0e0',
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Account Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              style={{
                padding: '0.75rem 1rem',
                background: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              🔒 {showPasswordForm ? 'Hide' : 'Change Password'}
            </button>
            <button
              onClick={() => toast.info('Delete account feature coming soon!')}
              style={{
                padding: '0.75rem 1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 'bold',
              }}
            >
              🗑️ Delete Account
            </button>
          </div>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div style={{
            marginTop: '2rem',
            padding: '2rem',
            background: '#f8f9fa',
            borderRadius: '0.5rem',
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                  Minimum 6 characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn btn-primary"
                  style={{
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
                  style={{ background: '#6c757d', color: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
