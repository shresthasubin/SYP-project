import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Ticket } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import "../index.css";

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
  const { isDark, toggleTheme } = useTheme();

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

  const navInactiveClass = "nav-item text-text-secondary";
  const navActiveClass = "nav-item nav-item-active";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          <Link
            to="/movies"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            Book Now
          </Link>
          <Link
            to="/login"
            className={`rounded-lg border px-4 py-2 text-sm font-semibold text-text-primary transition-colors ${signInClass}`}
          >
            Sign In
          </Link>
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
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className={`mt-1 rounded-lg border px-3 py-2 text-center text-sm font-semibold text-text-primary ${signInClass}`}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
