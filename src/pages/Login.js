// Login Page - User login form
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../utils/useAuth';
import { validateEmail } from '../utils/helpers';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Invalid email format');
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login to Your Account</h1>
        <p className="auth-subtitle">Access your car rental bookings</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="form-group checkbox">
            <input type="checkbox" id="remember" name="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Link to Register */}
        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Sign up here</Link>
        </p>

        {/* Demo Credentials */}
        <div className="demo-credentials">
          <p className="text-gray">Demo Credentials:</p>
          <p className="text-gray">
            <strong>Customer:</strong> customer@example.com / password
          </p>
          <p className="text-gray">
            <strong>Admin:</strong> admin@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
