import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

const footerGroups = [
  {
    title: "Information",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Terms & Conditions", to: "/legal/terms" },
      { label: "Privacy Policy", to: "/legal/privacy" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Category",
    links: [
      { label: "Movies", to: "/movies" },
      { label: "Locations", to: "/locations" },
      { label: "Cookie Policy", to: "/legal/cookie" },
      { label: "Join as Hall Admin", to: "/hall-staff/apply" },
    ],
  },
];

const FooterHeading = ({ children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white">
      {children}
    </h3>
    <div className="mt-3 h-[3px] w-14 bg-accent" />
  </div>
);

const Footer = () => {
  return (
    <footer className="mt-8 border-t border-white/8 bg-[#171717] sm:mt-10">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <FooterHeading>About Us</FooterHeading>
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="CinemaHub logo" className="h-8 w-8" />
              <span className="text-2xl font-black tracking-tight text-white">
                CinemaHub
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
              Discover trending releases, book cinema seats quickly, and stay
              close to the next big premiere across Nepal.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <FooterHeading>{group.title}</FooterHeading>
              <ul className="space-y-3 text-sm text-white/70">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="transition hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <FooterHeading>Connect With Us</FooterHeading>
            <div className="space-y-3 text-sm text-white/70">
              <p>Phone: +977 9800000000</p>
              <p>Email: hello@cinemahub.com</p>
              <p>Kathmandu, Nepal</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-5 text-sm text-white/45">
          Copyright 2026 CinemaHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
