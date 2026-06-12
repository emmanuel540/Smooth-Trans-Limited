import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import { About, Services, Contact } from './pages/AboutAndOthers';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboards & Protections
import ProtectedRoute from './components/ProtectedRoute';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import DriverDashboard from './pages/driver/DriverDashboard';
import DispatcherDashboard from './pages/dispatcher/DispatcherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FleetManagement from './pages/admin/FleetManagement';
import DriverProfiles from './pages/admin/DriverProfiles';
import AnalyticsReports from './pages/admin/AnalyticsReports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Passenger Routes */}
        <Route 
          path="/dashboard/customer/*" 
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Driver Routes */}
        <Route 
          path="/dashboard/driver/*" 
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Dispatcher Routes */}
        <Route 
          path="/dashboard/dispatcher/*" 
          element={
            <ProtectedRoute allowedRoles={['dispatcher']}>
              <DispatcherDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/fleet" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FleetManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/drivers" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DriverProfiles />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin/reports" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsReports />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
