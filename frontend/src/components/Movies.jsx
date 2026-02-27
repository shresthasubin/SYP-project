import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, API_SERVER_URL } from "../config/api";
import "../index.css";

function MovieCard({
  title,
  year,
  director,
  duration,
  rating,
  tags,
  image,
  accent = "bg-pink-500",
  reverse = false,
}) {
  return (
    <div className="relative w-[350px] h-[500px] rounded-[35px] shadow-[0_0_50px_#0F274D] overflow-hidden group">
      <div
        className={`absolute inset-0 ${accent} -z-10 flex items-end justify-center pb-4`}
      >
        <button className="uppercase font-bold text-lg tracking-wide text-white hover:text-gray-200">
          watch now
        </button>
      </div>

      <div
        className={`absolute inset-0 p-6 rounded-[35px] overflow-hidden transition-all duration-500
        ${reverse ? "top-[-50px] group-hover:top-0" : "group-hover:-top-[50px]"}`}
      >
        <img
          src={image}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500
          ${reverse ? "scale-110 group-hover:scale-100" : "group-hover:scale-110"}`}
        />

        <div className="absolute bottom-0 w-full h-[170px] bg-[#0F274D] blur-xl shadow-[0_0_20px_20px_#0F274D]" />

        <div className="absolute bottom-6 text-white">
          <h1 className="text-3xl font-bold capitalize">{title}</h1>
          <p className="text-sm text-gray-300 font-semibold capitalize">
            {year} � {director}
          </p>

          <b className="block mt-1">{duration}</b>

          <div className="mt-2 text-sm text-gray-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`fa fa-star ${i <= rating ? "text-orange-400" : ""}`}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full bg-white/20"
              >
                #{tag}
              </span>
            ))}
          </div>

          <i
            className={`fa ${
              reverse ? "fa-angle-down" : "fa-angle-up"
            } absolute left-1/2 -translate-x-1/2 -bottom-4 text-2xl text-gray-400`}
          />
        </div>
      </div>
    </div>
  );
}

const ACCENTS = [
  "bg-pink-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
];

const FALLBACK_POSTER =
  "https://via.placeholder.com/600x900/111827/ffffff?text=Movie";

const getMoviePosterUrl = (poster) => {
  if (!poster) return FALLBACK_POSTER;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const normalizeTags = (genre) => {
  if (Array.isArray(genre)) return genre.slice(0, 3);
  if (typeof genre === "string") {
    return genre
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);
  }
  return ["movie"];
};

const normalizeDuration = (duration) => {
  if (!duration) return "N/A";
  if (typeof duration === "number") return `${duration} mins`;
  return duration;
};

const normalizeYear = (releaseDate) => {
  if (!releaseDate) return "N/A";
  const parsed = new Date(releaseDate);
  return Number.isNaN(parsed.getTime()) ? "N/A" : String(parsed.getFullYear());
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
          const mappedMovies = response.data.data.map((movie, index) => ({
            title: movie.movie_title || movie.title || "Untitled",
            year: normalizeYear(movie.releaseDate),
            director: movie.director || "Unknown Director",
            duration: normalizeDuration(movie.duration),
            rating: Math.min(5, Math.max(1, Math.round(movie.rating || 4))),
            tags: normalizeTags(movie.genre),
            image: getMoviePosterUrl(movie.moviePoster),
            accent: ACCENTS[index % ACCENTS.length],
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

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary mb-4">
          Featured Movies
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="text-gray-400">No movies available right now.</p>
        ) : (
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-4">
              {movies.map((movie, index) => (
                <div key={`${movie.title}-${index}`} className="shrink-0 w-80">
                  <MovieCard {...movie} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
