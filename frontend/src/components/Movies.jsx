import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Ticket, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import "../index.css";

/* ===== CONFIG ===== */
const CARD_WIDTH = 300;
const CARD_HEIGHT = 400;
const GAP = 20;
const SLIDE_WIDTH = CARD_WIDTH + GAP;
const SPRING = { type: "spring", stiffness: 300, damping: 30 };

/* ===== DATA ===== */
const NOW_SHOWING = [
  { id: 1, title: "Dune: Part Two", rating: 9.4, genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0" },
  { id: 2, title: "Oppenheimer", rating: 9.6, genre: "Drama", image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0" },
  { id: 3, title: "The Batman", rating: 8.9, genre: "Action", image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cd4" },
  { id: 4, title: "Avatar 2", rating: 8.7, genre: "Adventure", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23" },
  { id: 5, title: "Blade Runner 2049", rating: 9.2, genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b" },
  { id: 6, title: "Interstellar", rating: 9.5, genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa" }
];

const UPCOMING = [
  { id: 7, title: "Inception", rating: 9.3, genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" },
  { id: 8, title: "Tenet", rating: 8.6, genre: "Sci-Fi", image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4" },
  { id: 9, title: "Guardians of Galaxy 3", rating: 9.1, genre: "Action", image: "https://images.unsplash.com/photo-1517602302552-471fe67acf66" },
  { id: 10, title: "Black Panther 2", rating: 9.0, genre: "Action", image: "https://images.unsplash.com/photo-1604079628437-179d46a53f26" }
];

/* ===== CAROUSEL COMPONENT ===== */
const MovieCarousel = ({ title, movies }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(1);

  /* ===== CALCULATE VISIBLE CARDS ===== */
  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setVisibleCards(Math.floor(width / SLIDE_WIDTH));
    };
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);

  const maxIndex = Math.max(movies.length - visibleCards, 0);

  const nextSlide = () => {
    if (currentIndex < maxIndex) setCurrentIndex(i => i + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-white">{title}</h2>
      <div ref={containerRef} className="relative overflow-hidden">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          style={{ gap: GAP }}
          drag="x"
          dragConstraints={{ left: -maxIndex * SLIDE_WIDTH, right: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            if (info.offset.x < -50 && currentIndex < maxIndex) nextSlide();
            if (info.offset.x > 50 && currentIndex > 0) prevSlide();
          }}
          animate={{ x: -currentIndex * SLIDE_WIDTH }}
          transition={SPRING}
        >
          {movies.map(movie => (
            <div
              key={movie.id}
              className="flex-shrink-0 rounded-xl overflow-hidden shadow-lg relative group"
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
              onClick={() => navigate(`/movies/${movie.id}`)}
            >
              <img
                src={`${movie.image}?w=${CARD_WIDTH}&h=${CARD_HEIGHT}&fit=crop`}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-lg font-semibold truncate">{movie.title}</h3>
                <div className="flex justify-between text-sm text-gray-300 mt-1">
                  <span>{movie.genre}</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={16} fill="currentColor" /> {movie.rating}
                  </span>
                </div>
                <button className="mt-2 w-full py-2 bg-accent text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                  <Ticket size={16} /> Book
                </button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* LEFT BUTTON */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/60 p-3 rounded-full disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={24} />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/60 p-3 rounded-full disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
};

/* ===== MAIN MOVIES COMPONENT ===== */
const Movies = () => {
  return (
    <div className="container mx-auto px-6 py-10">
      <MovieCarousel title="Now Showing" movies={NOW_SHOWING} />
      <MovieCarousel title="Upcoming Shows" movies={UPCOMING} />
    </div>
  );
};

export default Movies;
