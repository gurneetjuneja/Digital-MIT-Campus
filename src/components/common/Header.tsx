import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar?: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { currentUser } = useAuth();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {toggleSidebar && (
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 focus:outline-none lg:hidden mr-2"
            >
              <Menu size={20} />
            </button>
          )}
          
          <h2 className="text-xl font-semibold text-gray-800 mr-6">{title}</h2>
          
          <div className="relative hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </span>
            <input 
              className="form-input w-64 pl-10" 
              type="text" 
              placeholder="Search gate passes..." 
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-1 bg-red-500 rounded-full"></span>
          </button>
          
          {currentUser && (
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#4B0082] text-white flex items-center justify-center mr-2">
                <span className="font-semibold text-xs">{currentUser.profilePic || currentUser.name.substring(0, 2)}</span>
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">{currentUser.name}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;