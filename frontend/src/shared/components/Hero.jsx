import React, { useState, useEffect } from "react";
import { Play, TvMinimalPlay, Clock, Calendar, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_SERVER_URL } from "../config/api.js";

import "../../index.css";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop";

const getMoviePosterUrl = (poster) => {
  if (!poster || String(poster).startsWith("undefined-")) return FALLBACK_POSTER;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const normalizeHeroMovies = (movies) =>
  movies
    .filter((movie) => movie?.isPlaying !== false)
    .map((movie) => ({
      ...movie,
      movie_title: movie.movie_title || movie.title || "Untitled Movie",
      moviePoster: getMoviePosterUrl(movie.moviePoster),
      movieTrailer: movie.movieTrailer || "",
      description: movie.description || "No description available yet.",
      duration: Number(movie.duration) || 0,
      genre:
        Array.isArray(movie.genre) && movie.genre.length > 0
          ? movie.genre
          : typeof movie.genre === "string" && movie.genre.trim()
            ? movie.genre
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : ["Movie"],
      releaseDate: movie.releaseDate || new Date().toISOString(),
    }));

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
    className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter mb-6 uppercase"
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
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/movie/get`, {
          withCredentials: true,
        });

        if (response.data?.success && Array.isArray(response.data.data)) {
          setMovies(normalizeHeroMovies(response.data.data));
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Failed to fetch hero movies", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (activeIndex >= movies.length && movies.length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, movies.length]);

  const activeMovie = movies[activeIndex];

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || movies.length <= 1) return;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeIndex, autoPlay, movies.length]);

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const handleOpenDetails = () => {
    if (!activeMovie?.id) {
      navigate("/movies");
      return;
    }

    navigate(`/movies/${activeMovie.id}`);
  };

  const handleWatchTrailer = () => {
    if (!activeMovie?.movieTrailer) {
      handleOpenDetails();
      return;
    }

    const trailerUrl = /^https?:\/\//i.test(activeMovie.movieTrailer)
      ? activeMovie.movieTrailer
      : `${API_SERVER_URL}/uploads/${String(activeMovie.movieTrailer)
          .replace(/^\/+/, "")
          .replace(/^uploads\//, "")}`;

    window.open(trailerUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="relative">
        <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-primary text-white sm:min-h-[80vh] md:min-h-screen">
          <p className="text-sm uppercase tracking-[0.4em] text-text-secondary">
            Loading movies...
          </p>
        </section>
      </div>
    );
  }

  if (!activeMovie) {
    return (
      <div className="relative">
        <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-primary text-white sm:min-h-[80vh] md:min-h-screen">
          <p className="text-sm uppercase tracking-[0.4em] text-text-secondary">
            No movies available right now.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="relative ">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative w-full min-h-[70vh] sm:min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-primary text-white">
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
              className="absolute inset-0 bg-cover bg-center sm:bg-right"
              style={{ backgroundImage: `url('${activeMovie.moviePoster}')` }}
            />

            {/* Dark Left Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container - Moved Further Left */}
        <div className="relative z-20 w-full py-12 px-4 sm:px-6 md:px-10 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${activeMovie.id}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl sm:max-w-2xl lg:max-w-3xl space-y-4"
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
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg"
              >
                {activeMovie.movie_title}
              </motion.h1>

              {/* Metadata Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2 sm:gap-3 mb-6"
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
               
            
               
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white text-sm sm:text-base leading-relaxed max-w-2xl mb-8 drop-shadow-lg"
              >
                {activeMovie.description}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatchTrailer}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-accent text-white font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors drop-shadow-lg"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Trailer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenDetails}
                  className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white/10 transition-all drop-shadow-lg"
                >
                  Detail →
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ==================== CAROUSEL SECTION ==================== */}
      <section className="relative z-30 mt-8 pb-16" aria-label="Movie carousel">
        <div className="w-full">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 px-6 lg:px-20 ">
            <h2 className="text-text-primary font-bold tracking-wider uppercase text-sm flex items-center gap-3">
              <span className="w-8 h-0.5 bg-accent" aria-hidden="true" />
          
            </h2>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Hero;
