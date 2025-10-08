import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, loading, error } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4B0082]" />
      </div>
    );
  }

  // Handle authentication error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Authentication Error</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="text-[#4B0082] hover:text-[#6B238E] hover:underline"
        >
          Return to Login
        </button>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get the default route for the user's role
  const getDefaultRoute = (role: string) => {
    switch (role) {
      case 'security':
        return '/security';
      case 'faculty':
        return '/faculty';
      case 'admin':
        return '/admin';
      default:
        return '/login';
    }
  };

  // Check if user has required role
  if (!allowedRoles.includes(currentUser.role)) {
    // If user is authenticated but doesn't have the required role,
    // redirect them to their default dashboard
    const defaultRoute = getDefaultRoute(currentUser.role);
    if (location.pathname !== defaultRoute) {
      return <Navigate to={defaultRoute} replace />;
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;