// Cars Page - Simple car listing
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import './Home.css';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getAllCars({ limit: 1000 });
      setCars(response.data || []);
    } catch (error) {
      toast.error('Failed to load cars');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="container">
        <section className="cars-section" style={{ marginTop: '2rem' }}>
          <h1 style={{ marginBottom: '2rem' }}>All Cars</h1>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading cars...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="no-results">
              <p>No cars available</p>
            </div>
          ) : (
            <div className="cars-grid">
              {cars.map((car) => (
                <div key={car._id} className="car-card">
                  <div className="car-image">
                    <img
                      src={car.images[0]?.startsWith('http') ? car.images[0] : `http://localhost:5000${car.images[0]}`}
                      alt={car.name}
                    />
                  </div>
                  <div className="car-info">
                    <h3>{car.name}</h3>
                    <p className="car-brand">{car.brand} {car.model}</p>
                    
                    <div className="car-features">
                      <span>🪑 {car.seatingCapacity} Seats</span>
                      <span>⛽ {car.fuelType}</span>
                      <span>⚙️ {car.transmission}</span>
                      <span>📊 {car.mileage} km/l</span>
                    </div>

                    <div className="car-footer">
                      <div className="car-price">
                        <span className="price-label">Per Day</span>
                        <span className="price-value">{formatCurrency(car.rentPerDay)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/cars/${car._id}`} className="btn" style={{ flex: 1, textAlign: 'center', background: '#6c757d', color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' }}>
                          Details
                        </Link>
                        <Link to={`/booking/${car._id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.5rem 1rem' }}>
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Cars;
