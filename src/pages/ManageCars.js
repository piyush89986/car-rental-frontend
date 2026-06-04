// Manage Cars - Admin page to view and manage all cars
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import carService from '../services/bookingService';
import { formatCurrency } from '../utils/helpers';
import './Home.css';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    fuelType: '',
    seatingCapacity: '',
  });

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const response = await carService.getAllCars({
        ...filters,
        limit: 1000,
      });
      
      if (response.data) {
        setCars(response.data);
      }
    } catch (error) {
      console.error('Fetch cars error:', error);
      toast.error('Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      await carService.deleteCar(carId);
      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      console.error('Delete car error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete car');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      fuelType: '',
      seatingCapacity: '',
    });
  };

  const uniqueBrands = [...new Set(cars.map(car => car.brand))].sort();

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading"></div>
        <p>Loading cars...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Manage Cars</h1>
          <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0' }}>Total: {cars.length} cars</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/admin" className="btn" style={{ background: '#6c757d', color: 'white', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
          <button 
            className="btn btn-primary"
            onClick={() => toast.info('Add car feature coming soon!')}
          >
            + Add New Car
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        border: '2px solid #e0e0e0',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Filters</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Brand</label>
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
              }}
            >
              <option value="">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Fuel Type</label>
            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
              }}
            >
              <option value="">All Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Seating</label>
            <select
              name="seatingCapacity"
              value={filters.seatingCapacity}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '0.5rem',
              }}
            >
              <option value="">All</option>
              <option value="2">2 Seater</option>
              <option value="4">4 Seater</option>
              <option value="5">5 Seater</option>
              <option value="7">7 Seater</option>
            </select>
          </div>
        </div>
        <button
          onClick={clearFilters}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Cars Grid */}
      {cars.length === 0 ? (
        <div style={{
          background: '#f8f9fa',
          padding: '3rem',
          borderRadius: '0.5rem',
          textAlign: 'center',
        }}>
          <h3 style={{ color: '#6c757d' }}>No cars found</h3>
          <p style={{ color: '#adb5bd' }}>Try adjusting your filters or add a new car</p>
        </div>
      ) : (
        <div className="cars-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          {cars.map(car => (
            <div key={car._id} className="car-card" style={{
              background: 'white',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={car.images[0]?.startsWith('http') 
                    ? car.images[0] 
                    : `http://localhost:5000${car.images[0]}`}
                  alt={car.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: car.availabilityStatus ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}>
                  {car.availabilityStatus ? 'Available' : 'Unavailable'}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{car.name}</h3>
                <p style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  {car.brand} {car.model} • {car.year}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}>
                  <div>
                    <span style={{ color: '#6c757d' }}>🪑 </span>
                    <span>{car.seatingCapacity} Seats</span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>⛽ </span>
                    <span>{car.fuelType}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>⚙️ </span>
                    <span>{car.transmission}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6c757d' }}>📊 </span>
                    <span>{car.mileage} km/l</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e0e0e0',
                }}>
                  <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Per Day</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0066cc' }}>
                    {formatCurrency(car.rentPerDay)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/cars/${car._id}`}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#0066cc',
                      color: 'white',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => toast.info('Edit feature coming soon!')}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(car._id)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCars;
