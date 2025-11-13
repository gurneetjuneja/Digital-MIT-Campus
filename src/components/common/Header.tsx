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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center flex-1 min-w-0">
          {toggleSidebar && (
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden mr-3 transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          
          <h2 className="text-xl font-semibold text-gray-800 mr-4 truncate">{title}</h2>
          
          <div className="relative hidden md:block flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </span>
            <input 
              className="form-input w-full pl-10" 
              type="text" 
              placeholder="Search..." 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {currentUser && (
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-[#4B0082] text-white flex items-center justify-center shadow-sm">
                <span className="font-semibold text-xs uppercase">
                  {currentUser.profilePic || currentUser.name.substring(0, 2)}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[150px] truncate">
                {currentUser.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;