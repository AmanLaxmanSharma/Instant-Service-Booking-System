// View: Main application component handling routing and layout
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ChooseVendor from './pages/ChooseVendor';
import BookService from './pages/BookService';
import Payment from './pages/Payment';
import History from './pages/History';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProfileSetup from './pages/vendor/VendorProfileSetup';

// Wrapper to conditionally render Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register'];
  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          } />

          {/* Customer Routes - User Role Required */}
          <Route path="/services" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/choose-vendor/:serviceId" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <ChooseVendor />
            </ProtectedRoute>
          } />
          <Route path="/book/:serviceId/:vendorId" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <BookService />
            </ProtectedRoute>
          } />
          <Route path="/book/:serviceId" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <BookService />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <History />
            </ProtectedRoute>
          } />

          {/* Vendor Routes - Vendor Role Required */}
          <Route path="/vendor/setup" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorProfileSetup />
            </ProtectedRoute>
          } />
          <Route path="/vendor" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Admin Role Required */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Catch-all route for unauthorized access */}
          <Route path="*" element={
            <ProtectedRoute>
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
                color: 'white'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h1>Access Denied</h1>
                  <p>You don't have permission to access this page.</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App;
