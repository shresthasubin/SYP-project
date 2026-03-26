import React, { useContext, useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, MapPin, LogOut, User, FileText, Clock3, CircleUserRound, X } from "lucide-react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthContext } from "../../../shared/context/AuthContext.jsx";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user } = useContext(AuthContext);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#e50914" },
          secondary: { main: "#0a0a0a" },
          background: { default: "#000000", paper: "#0a0a0a" },
          text: { primary: "#ffffff", secondary: "#9ca3af" },
          divider: "rgba(255,255,255,0.08)",
        },
        typography: {
          fontFamily: ["Outfit", "system-ui", "sans-serif"].join(","),
        },
        shape: { borderRadius: 10 },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: "none", borderColor: "rgba(255,255,255,0.08)" },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: { borderRadius: 10, textTransform: "none", fontWeight: 700 },
            },
          },
        },
      }),
    [],
  );

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

          <div className="mt-auto space-y-3 p-4 border-t border-white/10">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <CircleUserRound size={22} className="text-[#D72626]" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">{user?.fullname || "Admin"}</p>
                  <p className="text-xs text-text-secondary">{user?.role || "admin"}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded-full p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
                aria-label="Logout"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-secondary">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-7 py-8">
            <div className="rounded-3xl border border-white/5 bg-black/40 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default AdminLayout;
