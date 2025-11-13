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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4B0082]" />
      </div>
    );
  }

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

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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

  if (!allowedRoles.includes(currentUser.role)) {
    const defaultRoute = getDefaultRoute(currentUser.role);
    if (location.pathname !== defaultRoute) {
      return <Navigate to={defaultRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;