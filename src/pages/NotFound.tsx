import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const { currentUser } = useAuth();
  
  const getHomeLink = () => {
    if (!currentUser) return '/login';
    
    switch (currentUser.role) {
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
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link 
            to={getHomeLink()}
            className="btn btn-primary inline-flex items-center"
          >
            <Home size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;