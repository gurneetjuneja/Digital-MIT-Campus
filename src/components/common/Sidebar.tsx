import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, Clipboard, CheckSquare, User, Settings, LogOut, 
  Package, FileText, PlusCircle, History
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
          { to: '/faculty/history', icon: <History size={18} />, text: 'History' }
        ];
      case 'admin':
        return [
          { to: '/admin', icon: <Home size={18} />, text: 'Dashboard' },
          { to: '/admin/pending', icon: <Clipboard size={18} />, text: 'Pending Approval' },
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
    <div className="sidebar w-64">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#4B0082]">E-Gate Pass</h1>
        <p className="text-sm text-[#6B238E]">
          {role === 'security' ? 'Security Portal' : 
           role === 'faculty' ? 'Faculty Portal' : 'Admin Portal'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs uppercase text-[#6B238E] font-semibold mb-2">Main</p>
        
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-item ${isActive(link.to) ? 'active' : ''}`}
            >
              <span className="mr-3">{link.icon}</span>
              <span>{link.text}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {currentUser && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="profile-avatar-lg mr-3">
              <span className="font-semibold">{currentUser.profilePic || currentUser.name.substring(0, 2)}</span>
            </div>
            <div>
              <p className="font-semibold text-[#4B0082]">{currentUser.name}</p>
              <p className="text-xs text-[#6B238E]">{currentUser.role}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="mt-4 flex items-center text-gray-700 hover:text-[#4B0082] text-sm transition-colors"
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