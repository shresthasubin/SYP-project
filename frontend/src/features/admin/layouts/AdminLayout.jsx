import React, { useContext, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, MapPin, LogOut, User, FileText, Clock3, CircleUserRound } from "lucide-react";
import { AuthContext } from "../../../shared/context/AuthContext.jsx";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user } = useContext(AuthContext);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-white/10 text-text-primary"
      : "text-text-secondary hover:bg-white/5 hover:text-text-primary";

  // Protect admin routes
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!loading && isAuthenticated && user?.role !== "admin") {
      navigate(user?.role === "hall-admin" ? "/halladmin" : "/");
    }
  }, [isAuthenticated, loading, navigate, user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-primary text-text-primary font-display">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-primary">
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
          <Link
            to="/admin/showtimes"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/admin/showtimes",
            )}`}
          >
            <Clock3 size={20} />
            <span className="font-medium">Showtimes</span>
          </Link>
          <Link
            to="/admin/form-applications"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/admin/form-applications",
            )}`}
          >
            <FileText size={20} />
            <span className="font-medium">Form Applications</span>
          </Link>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-secondary">
        <div className="container mx-auto p-8">
          <div className="mb-6 flex justify-end">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-2">
              <CircleUserRound size={20} className="text-[#D72626]" />
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-white">{user?.fullname || "Admin"}</p>
                <p className="text-xs text-slate-400">{user?.role || "admin"}</p>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
