import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Home
import Home from './features/home/Home';
import { About, Services, Contact } from './features/home/AboutAndOthers';

// Auth
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';

// Shared
import ProtectedRoute from './features/shared/ProtectedRoute';

// Dashboards
import CustomerDashboard from './features/customer/CustomerDashboard';
import DriverDashboard from './features/driver/DriverDashboard';
import DispatcherDashboard from './features/dispatcher/DispatcherDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import FleetManagement from './features/admin/FleetManagement';
import DriverProfiles from './features/admin/DriverProfiles';
import AnalyticsReports from './features/admin/AnalyticsReports';

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
