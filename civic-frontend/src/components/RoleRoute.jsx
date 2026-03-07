import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserFromToken, isTokenValid } from '../services/auth';

// Usage: <RoleRoute allowedRoles={["admin","department_admin"]}><YourComponent/></RoleRoute>
function RoleRoute({ children, allowedRoles }) {
  const user = getUserFromToken();

  if (!isTokenValid() || !user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles not provided, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) return children;

  const role = user.role || 'user';

  // Normalize role for legacy tokens
  const normalizedRole = role === 'citizen' ? 'user' : role;

  if (allowedRoles.includes(normalizedRole)) {
    return children;
  }

  // Not authorized - redirect to dashboard or login
  return <Navigate to="/dashboard" replace />;
}

export default RoleRoute;
