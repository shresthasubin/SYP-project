import React, { useState, useEffect, useMemo, useRef } from "react";
import { Menu, X, Sun, Moon, Ticket, ChevronDown, LogOut } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import "../../index.css";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/movies", label: "Movies" },
  { to: "/locations", label: "Locations" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/hall-staff/apply", label: "Hall Staff" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const profileRef = useRef(null);

  const displayName = useMemo(() => {
    const fromUser = user?.fullname || user?.fullName || user?.name;
    if (fromUser) return fromUser;
    if (user?.email) return user.email.split("@")[0];
    return "Profile";
  }, [user]);

  const profileInitial = useMemo(
    () => (displayName?.trim()?.[0] || "P").toUpperCase(),
    [displayName],
  );

  const shellClass = isDark
    ? scrolled
      ? "border-white/20 bg-secondary/95 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-lg"
      : "border-white/10 bg-secondary/80 backdrop-blur-md"
    : scrolled
      ? "border-black/10 bg-white/95 shadow-[0_10px_28px_rgba(0,0,0,0.12)] backdrop-blur-lg"
      : "border-black/10 bg-white/90 backdrop-blur-md";

  const tabShellClass = isDark
    ? "border-white/10 bg-primary/40"
    : "border-black/10 bg-black/[0.03]";

  const subtleBtnClass = isDark
    ? "border-white/10 bg-primary/40 hover:border-white/20 hover:bg-white/10"
    : "border-black/10 bg-black/[0.03] hover:border-black/20 hover:bg-black/[0.06]";

  const signInClass = isDark
    ? "border-white/15 hover:bg-white/10"
    : "border-black/15 hover:bg-black/[0.05]";

  const mobilePanelClass = isDark
    ? "border-white/10 bg-secondary/95"
    : "border-black/10 bg-white/95";

  const profilePanelClass = isDark
    ? "border-white/10 bg-secondary/95"
    : "border-black/10 bg-white/95";

  const navInactiveClass = "nav-item text-text-secondary";
  const navActiveClass = "nav-item nav-item-active";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 left-0 z-50 w-full px-4 py-4 md:px-6">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 md:px-5 ${shellClass}`}
      >
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-text-primary md:text-xl"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-accent text-white">
            <Ticket size={15} />
          </span>
          Cinema Hub
        </Link>

        <ul className={`hidden items-center gap-1 rounded-xl border p-1 md:flex ${tabShellClass}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg border border-transparent px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? navActiveClass
                      : navInactiveClass
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={toggleTheme}
            className={`rounded-lg border p-2 text-text-primary transition-colors ${subtleBtnClass}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
         
          {loading ? (
            <span className={`rounded-lg border px-4 py-2 text-sm font-semibold text-text-secondary ${signInClass}`}>
              Loading...
            </span>
          ) : isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-semibold text-text-primary transition-colors ${signInClass}`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {profileInitial}
                </span>
                <span className="max-w-28 truncate">{displayName}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {profileOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl border p-3 shadow-2xl ${profilePanelClass}`}
                >
                  <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                  <p className="mb-3 truncate text-xs text-text-secondary">
                    {user?.email || "Signed in user"}
                  </p>
                  <Link
                    to="/profile"
                    className="block rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent hover:text-white"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-accent hover:text-white"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`rounded-lg border px-4 py-2 text-sm font-semibold text-text-primary transition-colors ${signInClass}`}
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="ml-3 flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className={`rounded-lg border p-2 text-text-primary ${subtleBtnClass}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className={`rounded-lg border p-2 text-text-primary ${subtleBtnClass}`}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className={`mx-auto mt-2 max-w-6xl rounded-2xl border p-3 backdrop-blur-md md:hidden ${mobilePanelClass}`}>
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg border border-transparent px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? navActiveClass : navInactiveClass
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/movies"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-accent px-3 py-2 text-center text-sm font-bold text-white"
            >
              Book Now
            </Link>
            {loading ? (
              <span className={`mt-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-secondary ${signInClass}`}>
                Loading...
              </span>
            ) : isAuthenticated ? (
              <div className={`mt-1 rounded-lg border p-3 ${tabShellClass}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {profileInitial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                    <p className="truncate text-xs text-text-secondary">{user?.email || ""}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-primary ${signInClass}`}
                >
                  View Profile
                </Link>
                <button
                  onClick={logout}
                  className={`mt-1 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-text-primary ${signInClass}`}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={`mt-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-primary ${signInClass}`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
