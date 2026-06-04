// Payment - Process payment for a booking
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import './Auth.css';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'Credit Card',
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
    accountNumber: '',
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getBookingById(bookingId);
      
      if (response.success) {
        const bookingData = response.data;
        
        // Check if payment is already completed
        if (bookingData.paymentStatus === 'Completed') {
          toast.info('Payment already completed for this booking');
          setTimeout(() => navigate(`/bookings/${bookingId}`), 2000);
          return;
        }

        // Check if booking is cancelled
        if (bookingData.status === 'Cancelled') {
          toast.error('Cannot process payment for cancelled booking');
          setTimeout(() => navigate(`/bookings/${bookingId}`), 2000);
          return;
        }

        setBooking(bookingData);
        setPaymentData(prev => ({
          ...prev,
          paymentMethod: bookingData.paymentMethod || 'Credit Card',
        }));
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to load booking details');
      setTimeout(() => navigate('/bookings'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePayment = () => {
    const { paymentMethod, cardNumber, cardHolderName, expiryDate, cvv, upiId, bankName } = paymentData;

    switch (paymentMethod) {
      case 'Credit Card':
      case 'Debit Card':
        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
          toast.error('Please enter a valid 16-digit card number');
          return false;
        }
        if (!cardHolderName.trim()) {
          toast.error('Please enter card holder name');
          return false;
        }
        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
          toast.error('Please enter expiry date in MM/YY format');
          return false;
        }
        if (!cvv || cvv.length < 3) {
          toast.error('Please enter valid CVV');
          return false;
        }
        break;

      case 'UPI':
        if (!upiId || !upiId.includes('@')) {
          toast.error('Please enter a valid UPI ID');
          return false;
        }
        break;

      case 'Net Banking':
        if (!bankName) {
          toast.error('Please select a bank');
          return false;
        }
        break;

      case 'Cash on Delivery':
        // No validation needed
        break;

      default:
        toast.error('Please select a payment method');
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }

    try {
      setIsProcessing(true);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentInfo = {
        paymentMethod: paymentData.paymentMethod,
        paymentStatus: 'Completed',
        paidAmount: booking.totalRent + (booking.insuranceCost || 0) + (booking.additionalCharges || 0),
      };

      const response = await carService.updatePaymentStatus(bookingId, paymentInfo);

      if (response.success) {
        toast.success('Payment completed successfully!');
        setTimeout(() => {
          navigate(`/bookings/${bookingId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 16) {
      setPaymentData(prev => ({
        ...prev,
        cardNumber: formatCardNumber(value),
      }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setPaymentData(prev => ({
        ...prev,
        expiryDate: value,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading payment details...</p>
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

  const totalAmount = booking.totalRent + (booking.insuranceCost || 0) + (booking.additionalCharges || 0);

  return (
    <div className="auth-container">
      <div className="auth-card register-card" style={{ maxWidth: '800px' }}>
        <Link to={`/bookings/${bookingId}`} className="back-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to Booking Details
        </Link>

        <h1>💳 Payment</h1>
        <p className="auth-subtitle">Complete your payment to confirm the booking</p>

        {/* Booking Summary */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '2px solid #e0e0e0',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Booking Summary</h3>
          {booking.carId && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#0066cc' }}>
                {booking.carId.name}
              </p>
              <p style={{ margin: 0, color: '#6c757d' }}>
                {booking.carId.brand} {booking.carId.model}
              </p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Rental ({booking.numberOfDays} days):</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(booking.totalRent)}</span>
            </div>
            {booking.insuranceSelected && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Insurance:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(booking.insuranceCost || 0)}</span>
              </div>
            )}
            {booking.additionalCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Additional Charges:</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(booking.additionalCharges)}</span>
              </div>
            )}
            <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '2px solid #dee2e6' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
              <span style={{ fontWeight: 'bold' }}>Total Amount:</span>
              <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          {/* Payment Method Selection */}
          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method *</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
                width: '100%',
              }}
            >
              <option value="Credit Card">💳 Credit Card</option>
              <option value="Debit Card">💳 Debit Card</option>
              <option value="UPI">📱 UPI</option>
              <option value="Net Banking">🏦 Net Banking</option>
              <option value="Cash on Delivery">💵 Cash on Delivery</option>
            </select>
          </div>

          {/* Credit/Debit Card Fields */}
          {(paymentData.paymentMethod === 'Credit Card' || paymentData.paymentMethod === 'Debit Card') && (
            <>
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength="19"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardHolderName">Card Holder Name *</label>
                <input
                  type="text"
                  id="cardHolderName"
                  name="cardHolderName"
                  value={paymentData.cardHolderName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    required
                    maxLength="5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="password"
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) {
                        handleChange(e);
                      }
                    }}
                    placeholder="123"
                    required
                    maxLength="4"
                  />
                </div>
              </div>
            </>
          )}

          {/* UPI Fields */}
          {paymentData.paymentMethod === 'UPI' && (
            <div className="form-group">
              <label htmlFor="upiId">UPI ID *</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={paymentData.upiId}
                onChange={handleChange}
                placeholder="yourname@upi"
                required
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '0.5rem' }}>
                Enter your UPI ID (e.g., 9876543210@paytm, username@oksbi)
              </small>
            </div>
          )}

          {/* Net Banking Fields */}
          {paymentData.paymentMethod === 'Net Banking' && (
            <div className="form-group">
              <label htmlFor="bankName">Select Bank *</label>
              <select
                id="bankName"
                name="bankName"
                value={paymentData.bankName}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '0.5rem',
                  width: '100%',
                }}
              >
                <option value="">-- Select Bank --</option>
                <option value="SBI">State Bank of India</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="Axis">Axis Bank</option>
                <option value="PNB">Punjab National Bank</option>
                <option value="Kotak">Kotak Mahindra Bank</option>
                <option value="BOB">Bank of Baroda</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Cash on Delivery Info */}
          {paymentData.paymentMethod === 'Cash on Delivery' && (
            <div style={{
              background: '#fff3cd',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '2px solid #ffc107',
              marginBottom: '1rem',
            }}>
              <p style={{ margin: 0, color: '#856404' }}>
                <strong>Note:</strong> You will pay {formatCurrency(totalAmount)} in cash when you pick up the vehicle.
                Please keep exact change ready.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div style={{
            background: '#d1ecf1',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '2px solid #bee5eb',
            marginBottom: '1.5rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c5460' }}>
              🔒 Your payment information is secure and encrypted. We never store your card details.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isProcessing}
            style={{
              fontSize: '1.1rem',
              padding: '0.875rem',
              width: '100%',
            }}
          >
            {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(totalAmount)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
