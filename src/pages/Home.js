// Home Page - Car listing and search
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import './Home.css';

const Home = () => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    fuelType: '',
    seatingCapacity: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    page: 1,
  });

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getAllCars(filters);
      setCars(response.data || []);
    } catch (error) {
      toast.error('Failed to load cars');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      page: 1,
    }));
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Ride</h1>
          <p>Book affordable, reliable cars in minutes</p>
        </div>
      </section>

      <div className="container">
        {/* Filters Section */}
        <section className="filters-section">
          <h2>Search & Filter</h2>
          <form className="filters-form" onSubmit={handleSearch}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="search">Search Car</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Car name, brand..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  placeholder="e.g., Toyota, Honda"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fuelType">Fuel Type</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="seatingCapacity">Seating</label>
                <select
                  id="seatingCapacity"
                  name="seatingCapacity"
                  value={filters.seatingCapacity}
                  onChange={handleFilterChange}
                >
                  <option value="">All Sizes</option>
                  <option value="2">2 Seater</option>
                  <option value="4">4 Seater</option>
                  <option value="5">5 Seater</option>
                  <option value="7">7 Seater</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="minPrice">Min Price (₹/day)</label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxPrice">Max Price (₹/day)</label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="10000"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Apply Filters
              </button>
            </div>
          </form>
        </section>

        {/* Cars Grid */}
        <section className="cars-section">
          <h2>Featured Cars</h2>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading cars...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="no-results">
              <p>No cars found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="cars-grid">
                {cars.slice(0, 3).map((car) => (
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
              
              {/* Explore More Button */}
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link 
                  to="/cars" 
                  className="btn btn-primary"
                  style={{
                    padding: '1rem 3rem',
                    fontSize: '1.1rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Explore More Cars →
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Customer Testimonials */}
        <section style={{ 
          marginTop: '5rem', 
          marginBottom: '4rem',
          textAlign: 'center',
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            color: '#1a1a1a',
          }}>
            What Our Customers Say
          </h2>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '1.1rem',
            marginBottom: '3rem',
            maxWidth: '800px',
            margin: '0 auto 3rem auto',
          }}>
            Discover why discerning travelers choose CarRental for their luxury car accommodations around the world.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {/* Testimonial 1 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop"
                  alt="Emma Rodriguez"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '1rem',
                    border: '2px solid #e0e0e0',
                  }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a' }}>Emma Rodriguez</h4>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Mumbai, India</p>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: '#ffc107', fontSize: '1.2rem' }}>★</span>
                ))}
              </div>
              <p style={{ color: '#495057', lineHeight: '1.6', margin: 0 }}>
                "I've rented cars from various companies, but the experience with CarRental was exceptional."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop"
                  alt="John Smith"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '1rem',
                    border: '2px solid #e0e0e0',
                  }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a' }}>John Smith</h4>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Delhi, India</p>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: '#ffc107', fontSize: '1.2rem' }}>★</span>
                ))}
              </div>
              <p style={{ color: '#495057', lineHeight: '1.6', margin: 0 }}>
                "CarRental made my trip so much easier. The car was delivered right to my door, and the customer service was fantastic!"
              </p>
            </div>

            {/* Testimonial 3 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop"
                  alt="Ava Johnson"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '1rem',
                    border: '2px solid #e0e0e0',
                  }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a1a' }}>Ava Johnson</h4>
                  <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Bangalore, India</p>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: '#ffc107', fontSize: '1.2rem' }}>★</span>
                ))}
              </div>
              <p style={{ color: '#495057', lineHeight: '1.6', margin: 0 }}>
                "I highly recommend CarRental! Their fleet is amazing, and I always feel like I'm getting the best deal with excellent service."
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
