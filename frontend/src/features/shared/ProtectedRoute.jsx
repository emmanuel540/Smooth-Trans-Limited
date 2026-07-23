import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if unauthorized
    const roleDashboards = {
      passenger: '/dashboard/customer',
      driver: '/dashboard/driver',
      dispatcher: '/dashboard/dispatcher',
      admin: '/dashboard/admin'
    };
    return <Navigate to={roleDashboards[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
