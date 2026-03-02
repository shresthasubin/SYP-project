import React, { useContext, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, MapPin, LogOut, Clock3, MessageSquare } from "lucide-react";
import { AuthContext } from "../../context/AuthContext.jsx";

const HallAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user } = useContext(AuthContext);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-white/10 text-text-primary"
      : "text-text-secondary hover:bg-white/5 hover:text-text-primary";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!loading && isAuthenticated && user?.role !== "hall-admin") {
      navigate(user?.role === "admin" ? "/admin" : "/");
    }
  }, [isAuthenticated, loading, navigate, user]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "hall-admin") {
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-primary text-text-primary font-display">
      <aside className="w-64 shrink-0 border-r border-white/10 bg-primary">
        <div className="flex h-16 items-center px-6 border-b border-white/10">
          <span className="text-xl font-bold text-[#D72626]">Hall Admin</span>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <Link
            to="/halladmin"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/halladmin",
            )}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/halladmin/movies"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/halladmin/movies",
            )}`}
          >
            <Film size={20} />
            <span className="font-medium">Movies</span>
          </Link>
          <Link
            to="/halladmin/halls"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/halladmin/halls",
            )}`}
          >
            <MapPin size={20} />
            <span className="font-medium">Halls</span>
          </Link>
          <Link
            to="/halladmin/showtimes"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/halladmin/showtimes",
            )}`}
          >
            <Clock3 size={20} />
            <span className="font-medium">Showtimes</span>
          </Link>
          <Link
            to="/halladmin/messages"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${isActive(
              "/halladmin/messages",
            )}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Messages</span>
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

      <main className="flex-1 overflow-y-auto bg-secondary">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HallAdminLayout;
