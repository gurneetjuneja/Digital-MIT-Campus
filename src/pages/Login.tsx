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

  // Redirect if user is already logged in
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
    <div className="min-h-screen bg-[#E5D1F2]/10 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={circleLogo} alt="MIT ADT Logo" className="w-24 h-24 mb-6" />
          <div className="flex items-center">
            <ClipboardList size={32} className="text-[#4B0082] mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-[#4B0082]">Digital Gate Pass</h1>
              <p className="text-[#6B238E]">Sign in to your account</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4B0082]">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md border-[#E5D1F2] shadow-sm 
                focus:border-[#4B0082] focus:ring-[#4B0082] focus:ring-opacity-50 text-[#4B0082]
                focus:ring-2 focus:ring-offset-2 placeholder-[#9B4BC0]/50
                outline-none focus:outline-none hover:border-[#6B238E]
                transition-colors duration-200"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4B0082]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md border-[#E5D1F2] shadow-sm 
                focus:border-[#4B0082] focus:ring-[#4B0082] focus:ring-opacity-50 text-[#4B0082]
                focus:ring-2 focus:ring-offset-2 placeholder-[#9B4BC0]/50
                outline-none focus:outline-none hover:border-[#6B238E]
                transition-colors duration-200"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
              text-white bg-[#4B0082] hover:bg-[#6B238E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B0082] 
              disabled:opacity-50 transition-colors duration-200"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B238E]">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/setup')}
              className="font-medium text-[#4B0082] hover:text-[#6B238E]"
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