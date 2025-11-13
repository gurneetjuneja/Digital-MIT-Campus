import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, Clipboard, CheckSquare, User, Settings, LogOut, 
  Package, FileText, PlusCircle, History, Receipt
} from 'lucide-react';

interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  text: string;
}

interface SidebarProps {
  role: 'security' | 'faculty' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  const getLinks = (): SidebarLink[] => {
    switch (role) {
      case 'security':
        return [
          { to: '/security', icon: <Home size={18} />, text: 'Dashboard' },
          { to: '/security/create-pass', icon: <PlusCircle size={18} />, text: 'Create Gate Pass' },
          { to: '/security/history', icon: <History size={18} />, text: 'History' }
        ];
      case 'faculty':
        return [
          { to: '/faculty', icon: <Home size={18} />, text: 'Dashboard' },
          { to: '/faculty/vcrs', icon: <Receipt size={18} />, text: 'VCRS' },
          { to: '/faculty/history', icon: <History size={18} />, text: 'History' }
        ];
      case 'admin':
        return [
          { to: '/admin', icon: <Home size={18} />, text: 'Dashboard' },
          { to: '/admin/pending', icon: <Clipboard size={18} />, text: 'Pending Approval' },
          { to: '/admin/budget-approvals', icon: <Receipt size={18} />, text: 'Budget Approvals' },
          { to: '/admin/users', icon: <User size={18} />, text: 'Users' },
          { to: '/admin/reports', icon: <FileText size={18} />, text: 'Reports' },
          { to: '/admin/settings', icon: <Settings size={18} />, text: 'Settings' }
        ];
      default:
        return [];
    }
  };
  
  const links = getLinks();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="sidebar w-64 flex-shrink-0">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[#4B0082] to-[#6B238E]">
        <h1 className="text-xl font-bold text-white mb-1">Digital MIT</h1>
        <p className="text-xs text-white/90">
          {role === 'security' ? 'Security Portal' : 
           role === 'faculty' ? 'Faculty Portal' : 'Admin Portal'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs uppercase text-gray-500 font-semibold mb-3 px-2">Navigation</p>
        
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-item ${isActive(link.to) ? 'active' : ''}`}
            >
              <span className="mr-3 flex-shrink-0">{link.icon}</span>
              <span className="truncate">{link.text}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {currentUser && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3">
            <div className="profile-avatar-lg mr-3 flex-shrink-0">
              <span className="font-semibold text-xs uppercase">
                {currentUser.profilePic || currentUser.name.substring(0, 2)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#4B0082] text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-[#6B238E] capitalize">{currentUser.role}</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center text-gray-700 hover:text-[#4B0082] 
              hover:bg-white rounded-lg py-2 px-3 text-sm transition-all duration-200"
          >
            <LogOut size={16} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;