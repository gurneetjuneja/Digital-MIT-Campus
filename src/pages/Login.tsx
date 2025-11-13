import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import circleLogo from '../assets/circle-logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      const defaultRoute = getDefaultRoute(user.role);
      navigate(defaultRoute, { replace: true });
      toast.success(`Welcome back, ${user.name}!`);
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5D1F2]/20 to-[#F8F4FC] flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <img 
            src={circleLogo} 
            alt="MIT ADT Logo" 
            className="w-20 h-20 md:w-24 md:h-24 mb-6 object-contain" 
          />
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-2">
              <ClipboardList size={28} className="text-[#4B0082] mr-2" />
              <h1 className="text-xl md:text-2xl font-bold text-[#4B0082]">
                Digital Transformation for MIT
              </h1>
            </div>
            <p className="text-sm md:text-base text-[#6B238E] mt-1">
              Sign in to your account
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082] focus:ring-opacity-20
                text-gray-900 placeholder-gray-400
                outline-none transition-all duration-200
                hover:border-gray-400"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                focus:border-[#4B0082] focus:ring-2 focus:ring-[#4B0082] focus:ring-opacity-20
                text-gray-900 placeholder-gray-400
                outline-none transition-all duration-200
                hover:border-gray-400"
              placeholder="Enter your password"
              required
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
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/setup')}
              className="font-medium text-[#4B0082] hover:text-[#6B238E] hover:underline transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;