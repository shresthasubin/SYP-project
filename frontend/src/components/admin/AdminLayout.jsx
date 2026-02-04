import React, { useContext, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, MapPin, LogOut, User } from "lucide-react";
import { AuthContext } from "../../context/AuthContext.jsx";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user } = useContext(AuthContext);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-white/10 text-white"
      : "text-slate-400 hover:bg-white/5 hover:text-white";

  // Protect admin routes
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-background-dark text-white font-display">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-black">
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold text-[#D72626]">
            CinemaHub Admin
          </span>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <Link
            to="/admin"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/admin",
            )}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/admin/users",
            )}`}
          >
            <User size={20} />
            <span className="font-medium">Users</span>
          </Link>
          <Link
            to="/admin/movies"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/admin/movies",
            )}`}
          >
            <Film size={20} />
            <span className="font-medium">Movies</span>
          </Link>

          <Link
            to="/admin/halls"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/admin/halls",
            )}`}
          >
            <MapPin size={20} />
            <span className="font-medium">Halls</span>
          </Link>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
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