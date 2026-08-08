import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext.jsx';

/**
 * ProtectedRoute
 *
 * Wraps any route that requires the user to be logged in.
 *
 * Props:
 *   - allowedRoles?: string[]  — if provided, only those roles may access the route.
 *                                 A logged-in user with the wrong role is sent to their
 *                                 own dashboard instead of /login.
 *   - children: ReactNode
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['farmer']}>
 *     <FarmerDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role } = useSession();
  const location = useLocation();

  // Not logged in → redirect to /login, preserving the page they tried to visit
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    const dashboardMap = { farmer: '/farmer', vet: '/vet', admin: '/admin' };
    return <Navigate to={dashboardMap[role] ?? '/'} replace />;
  }

  return children;
}
