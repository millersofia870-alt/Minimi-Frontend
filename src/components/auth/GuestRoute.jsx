import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext.jsx';

/**
 * GuestRoute
 *
 * Wraps routes that should only be accessible to logged-OUT users
 * (e.g. /login, /register).
 *
 * If the user is already logged in, they are redirected to their
 * role-specific dashboard automatically.
 *
 * Usage:
 *   <GuestRoute>
 *     <Auth />
 *   </GuestRoute>
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, role } = useSession();

  if (isAuthenticated) {
    const dashboardMap = { farmer: '/farmer', vet: '/vet', admin: '/admin' };
    return <Navigate to={dashboardMap[role] ?? '/'} replace />;
  }

  return children;
}
