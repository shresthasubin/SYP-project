import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, MapPin, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-[#D72626] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5';
  };

  return (
    <div className="flex h-screen w-full bg-background-dark text-white font-display">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/10 bg-black">
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold text-[#D72626]">CinemaHub Admin</span>
        </div>
        
        <nav className="flex flex-col gap-2 p-4">
          <Link
            to="/admin"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive('/admin')}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link
            to="/admin/movies"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive('/admin/movies')}`}
          >
            <Film size={20} />
            <span className="font-medium">Movies</span>
          </Link>
          
          <Link
            to="/admin/halls"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive('/admin/halls')}`}
          >
            <MapPin size={20} />
            <span className="font-medium">Halls</span>
          </Link>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#1a1a1a]">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
