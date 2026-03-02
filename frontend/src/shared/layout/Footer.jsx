import React from "react";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import "../../index.css";
const Footer = () => {
  return (
    <footer className="bg-secondary pt-16 pb-8 mt-16 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-extrabold mb-4 text-text-primary tracking-tighter">
              CINEMA<span className="text-accent">HUB</span>
            </h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              Experience movies like never before. Premium sound, crystal clear
              screens, and luxury seating.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-primary hover:bg-accent hover:-translate-y-1 transition-all duration-300"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-primary hover:bg-accent hover:-translate-y-1 transition-all duration-300"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-primary hover:bg-accent hover:-translate-y-1 transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-primary hover:bg-accent hover:-translate-y-1 transition-all duration-300"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-text-primary">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/movies"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-text-primary">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/legal/terms"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/cookie"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-text-secondary hover:text-accent hover:pl-1 transition-all"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-text-primary">
              Newsletter
            </h4>
            <p className="text-text-secondary mb-4">
              Subscribe to get latest updates and offers.
            </p>
            <form className="text-text-secondary flex gap-2 border border-black/60 rounded-lg ">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-text-primary placeholder-text-secondary outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                className="px-4 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover transition-colors"
              >
                <Mail size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/5 text-text-secondary text-sm">
          <p>&copy; 2024 CinemaHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
