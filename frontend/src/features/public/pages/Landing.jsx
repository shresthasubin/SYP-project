import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ChevronDown,
  CalendarClock,
} from "lucide-react";
import Hero from "../../../shared/components/Hero.jsx";
import MovieCalendar from "../../../shared/components/MovieCalendar.jsx";
import Halls from "../../../shared/components/Halls.jsx";

import heroPoster from "../../../assets/Batman.png";
import card1 from "../../../assets/Dune.jpg";
import card2 from "../../../assets/interstellar.jpg";
import card3 from "../../../assets/Oppenheimer.jpg";
import card4 from "../../../assets/avatar.png";
import card5 from "../../../assets/RoadToNinja.png";
import card6 from "../../../assets/purnaBahadur.png";
import card7 from "../../../assets/unkoSweater.png";

const NOW_SHOWING = [
  { title: "Dune: Part Two", genre: "Sci-Fi", image: card1, rating: 8.6 },
  { title: "Interstellar", genre: "Sci-Fi", image: card2, rating: 8.7 },
  { title: "Oppenheimer", genre: "Drama", image: card3, rating: 8.5 },
  { title: "Avatar", genre: "Adventure", image: card4, rating: 7.8 },
  { title: "Road To Ninja", genre: "Anime", image: card5, rating: 7.9 },
];

const COMING_SOON = [
  { title: "Purna Bahadur", genre: "Drama", image: card6, rating: 8.1 },
  { title: "Unko Sweater", genre: "Romance", image: card7, rating: 7.8 },
  { title: "Batman Returns", genre: "Action", image: heroPoster, rating: 8.0 },
  { title: "Oppenheimer Re-Run", genre: "Historical", image: card3, rating: 8.5 },
  { title: "Avatar Extended", genre: "Fantasy", image: card4, rating: 7.8 },
];

const TESTIMONIALS = [
  { name: "Nina", text: "Smooth booking and great seats. The whole flow is fast." },
  { name: "Raj", text: "The offers section helped me save on weekend shows." },
  { name: "Ariana", text: "Best place to discover what is playing near me." },
  { name: "Kushal", text: "Dark mode and mobile view are really clean now." },
];

const FAQS = [
  {
    q: "Can I cancel or reschedule tickets?",
    a: "Yes, cancellation and reschedule depend on hall policy and showtime cutoff.",
  },
  {
    q: "Do I need to print my ticket?",
    a: "No. Show the QR/e-ticket at entry from your confirmation page or email.",
  },
  {
    q: "Can I pick seats before payment?",
    a: "Yes, seat selection happens before checkout and stays locked briefly.",
  },
  {
    q: "How do promo codes work?",
    a: "Apply codes in checkout. Eligible offers are validated instantly.",
  },
];

const MovieRail = ({ title, subtitle, movies }) => (
  <section className="py-10">
    <div className="container mx-auto px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>
        <Link to="/movies" className="text-sm font-semibold text-accent hover:underline">
          View all
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <article
            key={movie.title}
            className="w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-secondary"
          >
            <img src={movie.image} alt={movie.title} className="h-56 w-full object-cover" />
            <div className="space-y-1 p-3">
              <h3 className="line-clamp-1 text-sm font-semibold text-text-primary">{movie.title}</h3>
              <p className="text-xs text-text-secondary">{movie.genre}</p>
              <p className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={12} fill="currentColor" /> {movie.rating}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-primary text-text-primary">
      <Hero />
      

      
      <MovieRail
        title="Coming Soon"
        subtitle="Get ready for upcoming releases and advanced bookings."
        movies={COMING_SOON}
      />

      <Halls />

      <section className="py-10">
        <div className="container mx-auto grid gap-6 px-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-secondary">
            <img src={card3} alt="Festival screening" className="h-48 w-full object-cover" />
            <div className="p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                Festival Pick
              </p>
              <h3 className="text-2xl font-bold">Horror Film Festival</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Late-night screenings, special guests, and limited seats.
              </p>
            </div>
          </article>
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-secondary">
            <img src={card2} alt="Student discount" className="h-48 w-full object-cover" />
            <div className="p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                Student Offer
              </p>
              <h3 className="text-2xl font-bold">Student Discount Days</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Flash student deals every week with valid student ID.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-3xl font-bold">Happy Customers</h2>
          <p className="mt-1 text-center text-sm text-text-secondary">
            Trusted by moviegoers for fast and reliable booking.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((item) => (
              <article key={item.name} className="rounded-xl border border-white/10 bg-secondary p-4">
                <p className="mb-2 flex text-yellow-400">
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                  <Star size={13} fill="currentColor" />
                </p>
                <p className="text-sm text-text-secondary">{item.text}</p>
                <p className="mt-3 text-sm font-semibold">{item.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={item.q} className="overflow-hidden rounded-lg border border-white/10 bg-secondary">
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    type="button"
                  >
                    {item.q}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && <p className="px-4 pb-4 text-sm text-text-secondary">{item.a}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="rounded-2xl border border-white/10 bg-secondary p-7 text-center">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <CalendarClock size={14} /> Ready for tonight?
            </p>
            <h2 className="text-3xl font-bold">Ready To Watch And Book Movies?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
              Get showtimes, select seats, and secure your booking before seats sell out.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/movies" className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white">
                Start Booking
              </Link>
              <Link
                to="/locations"
                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-text-primary"
              >
                Explore Halls
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
