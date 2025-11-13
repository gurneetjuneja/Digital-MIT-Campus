import React, { useState, useEffect } from 'react';
import { setupDefaultUsers, createUser } from '../scripts/setupUsers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      const defaultRoute = getDefaultRoute(currentUser.role);
      navigate(defaultRoute, { replace: true });
    }
  }, [currentUser, navigate]);

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

  const handleSetupDefaults = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await setupDefaultUsers();
      toast.success(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to set up users');
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      await createUser(email, password);
      toast.success('User created successfully! Logging you in...');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
      console.error('Create user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E5D1F2]/20 to-[#F8F4FC] p-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#4B0082] mb-2">
            System Setup
          </h2>
          <p className="text-sm text-gray-600">Initialize system users</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center text-[#6B238E] hover:text-[#4B0082] mb-2 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </button>

        <form onSubmit={handleCreateUser} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082] focus:ring-opacity-20
                text-gray-900 placeholder-gray-400
                outline-none transition-all duration-200
                hover:border-gray-400"
              placeholder="Email (@security.com, @faculty.com, or @admin.com)"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082] focus:ring-opacity-20
                text-gray-900 placeholder-gray-400
                outline-none transition-all duration-200
                hover:border-gray-400"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 
              rounded-lg shadow-md text-sm font-semibold 
              text-white bg-[#4B0082] hover:bg-[#6B238E] 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B0082] 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? 'Creating...' : 'Create User'}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSetupDefaults}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 
            border border-transparent rounded-lg shadow-md text-sm font-semibold text-white 
            bg-[#4B0082] hover:bg-[#6B238E] 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B0082]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? 'Setting Up...' : 'Set Up Default Users'}
        </button>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Email domains determine user roles:</p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>@security.com - Security access</li>
            <li>@faculty.com - Faculty access</li>
            <li>@admin.com - Admin access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Setup; 