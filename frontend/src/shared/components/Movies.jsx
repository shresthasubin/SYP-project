import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Star, Film } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, API_SERVER_URL } from "../config/api";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop";

const getMoviePosterUrl = (poster) => {
  if (!poster) return FALLBACK_POSTER;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const normalizeTags = (genre) => {
  if (Array.isArray(genre)) return genre.slice(0, 2);
  if (typeof genre === "string") {
    return genre
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  return ["Movie"];
};

const normalizeDuration = (duration) => {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
};

const normalizeYear = (releaseDate) => {
  if (!releaseDate) return "TBA";
  const parsed = new Date(releaseDate);
  return Number.isNaN(parsed.getTime()) ? "TBA" : String(parsed.getFullYear());
};

const MovieCard = ({ movie }) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-secondary transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_12px_40px_rgba(229,9,20,0.18)]">
      <div className="relative h-72 overflow-hidden">
        <img
          src={movie.image}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            {movie.year}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            <Star size={12} className="text-amber-400" fill="currentColor" />
            {movie.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-text-primary">{movie.title}</h3>
        <p className="line-clamp-1 text-sm text-text-secondary">{movie.director}</p>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            {movie.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Film size={13} />
            {movie.tags.join(" | ")}
          </span>
        </div>
        <div className="pt-1">
          {movie.id ? (
            <Link
              to={`/movies/${movie.id}`}
              className="inline-flex items-center rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
            >
              View Details
            </Link>
          ) : (
            <button
              type="button"
              className="inline-flex cursor-not-allowed items-center rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-text-secondary"
              disabled
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/movie/get`, {
          withCredentials: true,
        });

        if (response.data?.success && Array.isArray(response.data.data)) {
          const mappedMovies = response.data.data.map((movie) => ({
            id: movie.id,
            title: movie.movie_title || movie.title || "Untitled",
            year: normalizeYear(movie.releaseDate),
            director: movie.director || "Director unavailable",
            duration: normalizeDuration(movie.duration),
            rating: Number(movie.rating) || 4.0,
            tags: normalizeTags(movie.genre),
            image: getMoviePosterUrl(movie.moviePoster),
          }));
          setMovies(mappedMovies);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Failed to fetch movies", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const topCountLabel = useMemo(() => `${movies.length} titles`, [movies.length]);

  return (
    <section className="py-10">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Now Playing</h2>
            <p className="text-sm text-text-secondary">Browse and book from currently listed movies.</p>
          </div>
          <span className="rounded-full border border-white/15 bg-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
            {topCountLabel}
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            Loading movies...
          </div>
        ) : movies.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            No movies available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((movie, index) => (
              <MovieCard key={`${movie.id || movie.title}-${index}`} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Movies;
