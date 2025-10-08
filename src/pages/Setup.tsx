import React, { useState } from 'react';
import { setupDefaultUsers, createUser } from '../scripts/setupUsers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      const result = await createUser(email, password);
      toast.success(result.message);
      setEmail('');
      setPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
      console.error('Create user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E5D1F2]/10">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#4B0082] mb-4">
            System Setup
          </h2>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-[#6B238E] hover:text-[#4B0082] mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Login
        </button>

        <form onSubmit={handleCreateUser} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#4B0082] focus:border-[#4B0082] focus:z-10 sm:text-sm"
                placeholder="Email (@security.com, @faculty.com, or @admin.com)"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#4B0082] focus:border-[#4B0082] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
              ${isLoading ? 'bg-[#9B4BC0]' : 'bg-[#4B0082] hover:bg-[#6B238E]'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B0082]`}
          >
            {isLoading ? 'Creating...' : 'Create User'}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#6B238E]">Or</span>
          </div>
        </div>

        <button
          onClick={handleSetupDefaults}
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading ? 'bg-[#9B4BC0]' : 'bg-[#4B0082] hover:bg-[#6B238E]'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B0082]`}
        >
          {isLoading ? 'Setting Up...' : 'Set Up Default Users'}
        </button>

        <div className="mt-4 text-sm text-[#6B238E]">
          <p className="font-medium mb-2">Email domains determine user roles:</p>
          <ul className="list-disc pl-5 space-y-1">
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