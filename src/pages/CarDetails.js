// Car Details Page - Individual car information
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../utils/useAuth';
import './CarDetails.css';

const CarDetails = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  const fetchCarDetails = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getCarById(carId);
      setCar(response.car);
    } catch (error) {
      toast.error('Failed to load car details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="error-container">
        <p>Car not found</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="car-details-container">
      <Link to="/" className="back-link">← Back to Cars</Link>

      <div className="car-details-content">
        {/* Image Gallery */}
        <div className="image-gallery">
          <div className="main-image">
            {car.images && car.images.length > 0 ? (
              <img
                src={car.images[selectedImageIndex].startsWith('http') ? car.images[selectedImageIndex] : `http://localhost:5000${car.images[selectedImageIndex]}`}
                alt={car.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Car+Image';
                }}
              />
            ) : (
              <div className="placeholder">No Image Available</div>
            )}
          </div>

          {car.images && car.images.length > 1 && (
            <div className="thumbnail-gallery">
              {car.images.map((image, index) => (
                <img
                  key={index}
                  src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                  alt={`${car.name} ${index + 1}`}
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=Thumb';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Car Information */}
        <div className="car-information">
          <div className="car-header">
            <div>
              <h1>{car.name}</h1>
              <p className="car-brand-model">{car.brand} {car.model} ({car.year})</p>
            </div>
            <div className="car-rating">
              <span className="badge">Available</span>
            </div>
          </div>

          {/* Specifications */}
          <section className="specifications">
            <h2>Specifications</h2>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Seating Capacity</span>
                <span className="spec-value">{car.seatingCapacity} Seats</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Fuel Type</span>
                <span className="spec-value">{car.fuelType}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Transmission</span>
                <span className="spec-value">{car.transmission}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Mileage</span>
                <span className="spec-value">{car.mileage} km</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Color</span>
                <span className="spec-value">{car.color}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Rent/Day</span>
                <span className="spec-value">{formatCurrency(car.rentPerDay)}</span>
              </div>
            </div>
          </section>

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <section className="features">
              <h2>Features</h2>
              <ul className="features-list">
                {car.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Description */}
          {car.description && (
            <section className="description">
              <h2>Description</h2>
              <p>{car.description}</p>
            </section>
          )}

          {/* Pricing Section */}
          <section className="pricing-section">
            <h2>Pricing</h2>
            <div className="price-info">
              <div className="price-item">
                <span>Daily Rate</span>
                <strong>{formatCurrency(car.rentPerDay)}</strong>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="action-buttons">
            {isAuthenticated ? (
              <Link to={`/booking/${car._id}`} className="btn btn-secondary btn-large">
                Book This Car
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-large">
                Login to Book
              </Link>
            )}
            <Link to="/" className="btn btn-outline btn-large">
              View More Cars
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
