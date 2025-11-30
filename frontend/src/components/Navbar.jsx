import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import "../index.css";  
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-secondary/80 backdrop-blur-md py-4 border-b border-white/10' 
        : 'py-6'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)} className="text-2xl font-extrabold text-text-primary tracking-tighter">
          CINEMA<span className="text-accent">HUB</span>
        </Link>

        <ul className="hidden md:flex gap-8">
          <li>
            <NavLink to="/" end className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-primary hover:text-accent'}`}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/movies" className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
              Movies
            </NavLink>
          </li>
          <li>
            <NavLink to="/locations" className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
              Locations
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({isActive}) => `font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}>
              About
            </NavLink>
          </li>
        </ul>

        <div className="flex items-center gap-6">
          <button className="p-2 rounded-full text-text-primary hover:bg-white/10 hover:text-accent transition-all">
            <Search size={20} />
          </button>
          <button className="p-2 rounded-full text-text-primary hover:bg-white/10 hover:text-accent transition-all">
            <Bell size={20} />
          </button>
          <Link to="/login" className="bg-accent text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/30 transition-all duration-300">
            Sign In
          </Link>
        </div>

     
        <div className="md:hidden ml-3 flex items-center">
          <button onClick={() => setOpen(!open)} className="p-2 rounded-full text-text-primary hover:bg-white/10 hover:text-accent transition-all">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>
      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-secondary/90 backdrop-blur-sm border-t border-white/5 w-full fixed left-0 top-[74px] z-40">
          <div className="px-6 py-6 flex flex-col gap-4">
            <NavLink to="/" onClick={() => setOpen(false)} className={({isActive}) => `${isActive ? 'text-accent' : 'text-text-primary'} text-lg`}>Home</NavLink>
            <NavLink to="/movies" onClick={() => setOpen(false)} className={({isActive}) => `${isActive ? 'text-accent' : 'text-text-primary'} text-lg`}>Movies</NavLink>
            <NavLink to="/locations" onClick={() => setOpen(false)} className={({isActive}) => `${isActive ? 'text-accent' : 'text-text-primary'} text-lg`}>Locations</NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)} className={({isActive}) => `${isActive ? 'text-accent' : 'text-text-primary'} text-lg`}>About</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className={({isActive}) => `${isActive ? 'text-accent' : 'text-text-primary'} text-lg`}>Contact</NavLink>
            <Link to="/login" onClick={() => setOpen(false)} className="mt-3 text-center py-2 bg-accent text-white rounded-full">Sign In</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
