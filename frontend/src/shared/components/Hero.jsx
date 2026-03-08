import React, { useState, useEffect } from "react";
import { Play, TvMinimalPlay, Clock, Calendar, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import img1 from "../../assets/interstellar.jpg";
import img2 from "../../assets/Oppenheimer.jpg";
import img3 from "../../assets/Dune.jpg";
import img4 from "../../assets/avatar.png";
import img5 from "../../assets/purnaBahadur.png";
import img6 from "../../assets/RoadToNinja.png";
import img7 from "../../assets/Batman.png";
import img8 from "../../assets/unkoSweater.png";

import "../../index.css";

const HERO_SLIDES = [
  {
    id: 1,
    movie_title: "INTERSTELLAR ODYSSEY",
    moviePoster: img1,
    rating: "PG-13",
    releaseDate: "2024-01-01",
    duration: 165, // 2h 45m in minutes
    genre: ["Sci-Fi", "Adventure"],
    match: "98% Match",
    description:
      "Embark on a journey beyond the stars. When humanity's time on Earth comes to an end, a team of explorers undertakes the most important mission in human history.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/interstellar-trailer",
  },
  {
    id: 2,
    movie_title: "DUNE: PART TWO",
    moviePoster: img3,
    rating: "PG-13",
    releaseDate: "2024-03-01",
    duration: 166, // 2h 46m in minutes
    genre: ["Sci-Fi", "Action"],
    match: "95% Match",
    description:
      "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/dune-trailer",
  },
  {
    id: 3,
    movie_title: "OPPENHEIMER",
    moviePoster: img2,
    rating: "PG-13",
    releaseDate: "2023-07-21",
    duration: 180, // 3h 00m in minutes
    genre: ["Biography", "Drama"],
    match: "96% Match",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/oppenheimer-trailer",
  },
  {
    id: 4,
    movie_title: "AVATAR: THE WAY OF WATER",
    moviePoster: img4,
    rating: "PG-13",
    releaseDate: "2022-12-16",
    duration: 192, // 3h 12m in minutes
    genre: ["Sci-Fi", "Fantasy"],
    match: "94% Match",
    description:
      "Jake Sully and Neytiri must protect their family as Pandora faces new threats from human invaders.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/avatar-trailer",
  },
  {
    id: 5,
    movie_title: "Purna Bahadur ko Sarangi",
    moviePoster: img5,
    rating: "PG",
    releaseDate: "2023-01-01",
    duration: 130, // 2h 10m in minutes
    genre: ["Drama", "Musical"],
    match: "92% Match",
    description:
      "A heartfelt Nepali story of Purna Bahadur, whose life and struggles are intertwined with the soulful sound of his sarangi.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/purna-trailer",
  },
  {
    id: 6,
    movie_title: "Naruto: Road to Ninja",
    moviePoster: img6,
    rating: "PG-13",
    releaseDate: "2012-07-28",
    duration: 110, // 1h 50m in minutes
    genre: ["Anime", "Action"],
    match: "95% Match",
    description:
      "Naruto and Sakura are transported to an alternate reality where they must confront powerful enemies and their own inner struggles.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/naruto-trailer",
  },
  {
    id: 7,
    movie_title: "Batman",
    moviePoster: img7,
    rating: "PG-13",
    releaseDate: "1989-06-23",
    duration: 126, // 2h 6m in minutes
    genre: ["Action", "Crime"],
    match: "93% Match",
    description:
      "The Dark Knight faces off against the Joker in Tim Burton's iconic reimagining of Gotham City.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/batman-trailer",
  },
  {
    id: 8,
    movie_title: "Unko Sweater",
    moviePoster: img8,
    rating: "PG",
    releaseDate: "2024-01-01",
    duration: 105, // 1h 45m in minutes
    genre: ["Romance", "Drama"],
    match: "90% Match",
    description:
      "A tender Nepali tale of love, memory, and the warmth of a sweater that carries the past into the present.",
    isPlaying: true,
    playEndDate: "2024-12-31",
    movieTrailer: "https://example.com/unko-trailer",
  },
];

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ==================== SUB-COMPONENTS ====================

/**
 * Background Image Component with Overlay Effects
 */
const HeroBackground = ({ movie }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={`bg-${movie.id}`}
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Background Image - Full Width */}
      <div
        className="absolute inset-0 bg-cover bg-right "
        style={{ backgroundImage: `url('${movie.moviePoster}')` }}
        role="img"
        aria-label={`${movie.movie_title} backdrop`}
      />

      {/* Overlay Effects */}
      <div className="absolute inset-0 bg-accent/10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary from-10% via-primary/80 via-50% to-transparent to-100%" />
    </motion.div>
  </AnimatePresence>
);

/**
 * Movie Metadata Badge Component
 */
const MovieMetadata = ({ movie }) => (
  <motion.div
    variants={fadeInUp}
    className="flex flex-wrap items-center gap-3 mb-6 filter:blur(0.5px)"
  >
    {/* Match Score Badge */}
    <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1.5 rounded-md border border-accent/30 uppercase tracking-widest backdrop-blur-sm">
      {movie.match}
    </span>

    {/* Movie Info */}
    <div className="flex items-center gap-2 text-text-secondary text-sm">
      <span className="font-semibold">{movie.releaseDate.split("-")[0]}</span>
      <span className="w-1 h-1 rounded-full bg-text-secondary/50" />
      <span className="px-2 py-0.5 border border-text-secondary/30 rounded text-xs">
        {movie.rating}
      </span>
      <span className="w-1 h-1 rounded-full bg-text-secondary/50" />
      <span>
        {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
      </span>
    </div>

    {/* Genre Tag */}
    <span className="text-text-secondary/80 text-xs font-medium px-3 py-1 bg-secondary/20 rounded-full border border-white/10">
      {Array.isArray(movie.genre) ? movie.genre.join(" / ") : movie.genre}
    </span>
  </motion.div>
);

/**
 * Animated Movie Title Component
 */
const MovieTitle = ({ title }) => (
  <motion.h1
    variants={fadeInUp}
    className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6 uppercase"
    style={{
      textShadow:
        "0 0 40px rgba(229, 9, 20, 0.4), 0 4px 20px rgba(0, 0, 0, 0.8)",
    }}
  >
    {title.split(" ").map((word, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
      >
        {word}
      </motion.div>
    ))}
  </motion.h1>
);

/**
 * Movie Description Component
 */
const MovieDescription = ({ description }) => (
  <motion.p
    variants={fadeInUp}
    className="text-text-secondary text-base md:text-lg leading-relaxed mb-8 max-w-xl font-medium"
  >
    {description}
  </motion.p>
);

/**
 * Action Buttons Component
 */

/**
 * Progress Indicator for Autoplay
 */

/**
 * Thumbnail Card Component
 */
const ThumbnailCard = ({ movie, index, activeIndex, onClick }) => {
  const isActive = index === activeIndex;

  return (
    <motion.article
      className="flex-shrink-0 group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Select ${movie.movie_title}`}
      onKeyPress={(e) => e.key === "Enter" && onClick()}
    >
      {/* Thumbnail Image */}
      <div
        className={`relative min-w-[280px] w-full max-w-sm h-40 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border-2 ${
          isActive
            ? "border-accent shadow-accent/30"
            : "border-white/10 opacity-60 hover:opacity-100"
        }`}
      >
        <div
          className={`w-full h-full bg-cover bg-center transition-all duration-500 ${
            isActive
              ? "grayscale-0 scale-100"
              : "grayscale group-hover:grayscale-0"
          }`}
          style={{ backgroundImage: `url('${movie.moviePoster}')` }}
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-accent/90 rounded-full p-3">
            <Play size={24} fill="white" className="text-white" />
          </div>
        </div>
      </div>

      {/* Title */}
      <p
        className={`mt-3 text-sm transition-colors font-medium -ml-1 ${
          isActive
            ? "font-bold text-text-primary"
            : "text-text-secondary group-hover:text-text-primary"
        }`}
      >
        {movie.movie_title}
      </p>
    </motion.article>
  );
};

// ==================== MAIN COMPONENT ====================

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const activeMovie = HERO_SLIDES[activeIndex];

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeIndex, autoPlay]);

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  return (
    <div className="relative ">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-[100%] min-h-screen flex items-center justify-center overflow-hidden bg-primary text-white">
        {/* Background Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${activeMovie.id}`}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-right"
              style={{ backgroundImage: `url('${activeMovie.moviePoster}')` }}
            />

            {/* Dark Left Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container - Moved Further Left */}
        <div className="relative z-20 w-full py-10 pl-6 lg:pl-12 pr-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${activeMovie.id}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              {/* Spotlight Label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-accent text-sm font-bold uppercase tracking-widest mb-4"
              >
                #{activeIndex + 1} Spotlight
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg"
              >
                {activeMovie.movie_title}
              </motion.h1>

              {/* Metadata Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                <span className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                  <TvMinimalPlay size={14} className="text-accent" />
                  {Array.isArray(activeMovie.genre)
                    ? activeMovie.genre[0]
                    : activeMovie.genre}
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-white/10 backdrop-blur px-4 py-1.5 rounded-full border border-white/20">
                  <Clock size={14} className="text-accent" />
                  {Math.floor(activeMovie.duration / 60)}h{" "}
                  {activeMovie.duration % 60}m
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                  <Calendar size={14} className="text-accent" />
                  {new Date(activeMovie.releaseDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
                <span className="inline-flex items-center text-sm text-white font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                  HD
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                  <Star size={14} className="text-amber-400" fill="currentColor" />
                  {(activeMovie.duration / 20).toFixed(1)}
                </span>
               
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white text-base leading-relaxed max-w-lg mb-8 drop-shadow-lg"
              >
                {activeMovie.description}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full bg-accent text-white font-bold flex items-center gap-2 hover:bg-accent/90 transition-colors drop-shadow-lg"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white/10 transition-all drop-shadow-lg"
                >
                  Detail →
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chevron navigation (left/right manual slide switching) is temporarily disabled.
            Keep this block for later re-enable with the same wrap-around + autoplay pause logic.
        <motion.button
          onClick={() => {
            setActiveIndex(
              (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
            );
            setAutoPlay(false);
            setTimeout(() => setAutoPlay(true), 5000);
          }}
          className="absolute right-8 bottom-30 -translate-y-1/2 z-30 bg-white/40 backdrop-blur text-white p-3  hover:bg-red-700 transition-colors drop-shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={28} />
        </motion.button>
        <motion.button
          onClick={() => {
            setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
            setAutoPlay(false);
            setTimeout(() => setAutoPlay(true), 5000);
          }}
          className="absolute right-8 bottom-50 -translate-y-1/2 z-30 bg-white/40 backdrop-blur text-white p-3  hover:bg-red-600 transition-colors drop-shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={28} />
        </motion.button>
        */}
      </section>

      {/* ==================== CAROUSEL SECTION ==================== */}
      <section className="relative z-30 mt-8 pb-16" aria-label="Movie carousel">
        <div className="w-full">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 px-6 lg:px-20 ">
            <h2 className="text-text-primary font-bold tracking-wider uppercase text-sm flex items-center gap-3">
              <span className="w-8 h-0.5 bg-accent" aria-hidden="true" />
              <span>NOW SHOWING</span>
            </h2>
          </div>

          {/* Thumbnails */}
          <div
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-6 lg:px-20"
            role="list"
          >
       
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
