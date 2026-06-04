// App.js - Main application component with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Styles
import './styles/index.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import BookingForm from './pages/BookingForm';
import BookingHistory from './pages/BookingHistory';
import BookingDetails from './pages/BookingDetails';
import Payment from './pages/Payment';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import ManageCars from './pages/ManageCars';
import ManageBookings from './pages/ManageBookings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="container mt-3">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:carId" element={<CarDetails />} />

            {/* Customer Protected Routes */}
            <Route
              path="/booking/:carId"
              element={<ProtectedRoute><BookingForm /></ProtectedRoute>}
            />
            <Route
              path="/bookings"
              element={<ProtectedRoute><BookingHistory /></ProtectedRoute>}
            />
            <Route
              path="/bookings/:bookingId"
              element={<ProtectedRoute><BookingDetails /></ProtectedRoute>}
            />
            <Route
              path="/payment/:bookingId"
              element={<ProtectedRoute><Payment /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><UserProfile /></ProtectedRoute>}
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/cars"
              element={<ProtectedRoute adminOnly><ManageCars /></ProtectedRoute>}
            />
            <Route
              path="/admin/bookings"
              element={<ProtectedRoute adminOnly><ManageBookings /></ProtectedRoute>}
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

// 404 Not Found Page
const NotFound = () => (
  <div className="text-center mt-4" style={{ minHeight: '60vh' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/" className="btn btn-primary mt-3">
      Go to Home
    </a>
  </div>
);

export default App;
