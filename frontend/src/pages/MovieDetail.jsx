import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Ticket } from "lucide-react";
import axios from "axios";
import { API_BASE_URL, API_SERVER_URL } from "../config/api.js";

const formatDuration = (value) => {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const getPosterUrl = (moviePoster) => {
  if (!moviePoster) return "https://placehold.co/800x1200?text=No+Poster";
  if (String(moviePoster).startsWith("http")) return moviePoster;
  return `${API_SERVER_URL}/uploads/${moviePoster}`;
};

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const [movieRes, showtimeRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/movie/get/${id}`),
          axios.get(`${API_BASE_URL}/showtime/movie/${id}`),
        ]);

        if (!mounted) return;

        if (!movieRes.data?.success) {
          setError("Movie not found.");
          return;
        }

        setMovie(movieRes.data.data);
        setShowtimes(showtimeRes.data?.success ? showtimeRes.data.data || [] : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || "Failed to load movie details.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const genreLabel = useMemo(() => {
    if (!movie?.genre) return "Unknown";
    return Array.isArray(movie.genre) ? movie.genre.join(" / ") : String(movie.genre);
  }, [movie]);

  if (loading) {
    return (
      <section className="min-h-[60vh] py-20 pt-24 bg-secondary/40">
        <div className="container mx-auto px-6 text-text-secondary">Loading movie details...</div>
      </section>
    );
  }

  if (error || !movie) {
    return (
      <section className="min-h-[60vh] py-20 pt-24 bg-secondary/40">
        <div className="container mx-auto px-6">
          <p className="text-red-400">{error || "Movie not found."}</p>
          <Link
            to="/movies"
            className="mt-4 inline-block px-6 py-3 border border-white/10 rounded-md text-sm font-semibold hover:bg-white/5"
          >
            Back to list
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[60vh] flex items-center py-20 pt-24 bg-secondary/40">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 bg-primary rounded-xl overflow-hidden shadow-xl">
            <img
              src={getPosterUrl(movie.moviePoster)}
              alt={movie.movie_title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-4xl font-extrabold mb-4">{movie.movie_title}</h2>
            <div className="flex items-center gap-4 text-text-secondary mb-6">
              <div className="flex items-center gap-2 text-[#ffd700]">
                <Star size={18} fill="#ffd700" strokeWidth={0} />
                <strong className="text-white">{Number(movie.rating) || "N/A"}</strong>
              </div>
              <span className="px-3 py-1 border border-white/10 rounded text-sm">{genreLabel}</span>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">
              {movie.description || "No description available."}
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Showtimes</h4>
                {showtimes.length === 0 ? (
                  <p className="text-text-secondary text-sm">No showtimes listed yet.</p>
                ) : (
                  <ul className="text-text-secondary text-sm space-y-2">
                    {showtimes.slice(0, 5).map((showtime) => (
                      <li key={showtime.id}>
                        {showtime.show_date} - {String(showtime.start_time).slice(0, 5)} to{" "}
                        {String(showtime.end_time).slice(0, 5)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Duration</h4>
                <p className="text-text-secondary text-sm">{formatDuration(movie.duration)}</p>
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Release</h4>
                <p className="text-text-secondary text-sm">
                  {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Link
                to="/movies"
                className="inline-block px-6 py-3 border border-white/10 rounded-md text-sm font-semibold hover:bg-white/5"
              >
                Back to list
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md font-semibold hover:bg-accent-hover transition-all">
                <Ticket size={16} />
                Book Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
