import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Film, MapPin, Calendar, Ticket, MessageSquare, Users } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Movies', path: '/movies', icon: <Film size={20} /> },
    { name: 'Halls', path: '/halls', icon: <MapPin size={20} /> },
    { name: 'Showtimes', path: '/showtimes', icon: <Calendar size={20} />, disabled: true },
    { name: 'Bookings', path: '/bookings', icon: <Ticket size={20} />, disabled: true },
    { name: 'Live Chat', path: '/chat', icon: <MessageSquare size={20} />, disabled: true },
    { name: 'Users', path: '/users', icon: <Users size={20} />, disabled: true },
  ];

  return (
    <div className="h-screen w-64 bg-sidebar-bg border-r border-gray-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-red to-neon-blue bg-clip-text text-transparent">
          CINEMAHUB
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.disabled ? '#' : item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.disabled 
                  ? 'opacity-50 cursor-not-allowed text-gray-500 hover:bg-transparent' 
                  : isActive 
                    ? 'bg-neon-red/10 text-neon-red border-r-2 border-neon-red' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-purple-600"></div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-500">admin@cineverse.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
