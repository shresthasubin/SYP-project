import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const SEEDED_MOVIES = [
  { id: "seed-1", title: "Dune: Messiah", releaseDate: "2026-03-20" },
  { id: "seed-2", title: "Avatar 4", releaseDate: "2026-12-18" },
  { id: "seed-3", title: "The Batman Part II", releaseDate: "2026-10-02" },
  { id: "seed-4", title: "Interstellar Re-Release", releaseDate: "2026-08-14" },
  { id: "seed-5", title: "Spider-Man: Beyond", releaseDate: "2026-07-24" },
  { id: "seed-6", title: "Oppenheimer Special Cut", releaseDate: "2026-05-15" },
  { id: "seed-7", title: "Comedy Night Screening", releaseDate: "2026-02-28" },
  { id: "seed-8", title: "Rock Revival Tour Film", releaseDate: "2026-02-20" },
  { id: "seed-9", title: "Phantom's Request", releaseDate: "2026-02-22" },
  { id: "seed-10", title: "Championship Documentary", releaseDate: "2026-02-25" },
];

const isValidDate = (value) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const normalizeMovieList = (list) =>
  list
    .filter((movie) => isValidDate(movie.releaseDate))
    .map((movie) => ({
      id: movie.id,
      title: movie.movie_title || movie.title || "Untitled",
      releaseDate: new Date(movie.releaseDate),
    }))
    .sort((a, b) => a.releaseDate - b.releaseDate);

const MovieCalendar = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleMonthDate, setVisibleMonthDate] = useState(() => new Date(2026, 1, 1));
  const [selectedDateKey, setSelectedDateKey] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/movie/get`, {
          withCredentials: true,
        });

        if (response.data?.success && Array.isArray(response.data.data)) {
          const mapped = normalizeMovieList(response.data.data);
          setMovies(mapped.length ? mapped : normalizeMovieList(SEEDED_MOVIES));
        } else {
          setMovies(normalizeMovieList(SEEDED_MOVIES));
        }
      } catch (error) {
        console.error("Failed to fetch movies for calendar", error);
        setMovies(normalizeMovieList(SEEDED_MOVIES));
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const month = visibleMonthDate.getMonth();
  const year = visibleMonthDate.getFullYear();

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return movies;
    return movies.filter((movie) => movie.title.toLowerCase().includes(query));
  }, [movies, searchQuery]);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    filteredMovies.forEach((movie) => {
      if (movie.releaseDate.getMonth() !== month || movie.releaseDate.getFullYear() !== year) return;
      const key = toDateKey(movie.releaseDate);
      const existing = map.get(key) || [];
      map.set(key, [...existing, movie]);
    });
    return map;
  }, [filteredMovies, month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const rows = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    const result = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [daysInMonth, firstWeekday]);

  useEffect(() => {
    if (selectedDateKey) return;
    const firstEventDateKey = [...eventsByDate.keys()][0];
    if (firstEventDateKey) setSelectedDateKey(firstEventDateKey);
  }, [eventsByDate, selectedDateKey]);

  const goPreviousMonth = () => {
    setVisibleMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDateKey("");
  };

  const goNextMonth = () => {
    setVisibleMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDateKey("");
  };

  return (
    <section className="container mx-auto px-6 pb-6">
      <div className="overflow-hidden rounded-[24px] border border-black/10 bg-secondary shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-4 border-b border-black/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={goPreviousMonth}
              className="rounded-lg border border-black/10 bg-primary px-3 py-2 text-text-primary hover:border-accent hover:text-accent"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-3xl font-black uppercase tracking-tight text-text-primary">
              {visibleMonthDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-lg border border-black/10 bg-primary px-3 py-2 text-text-primary hover:border-accent hover:text-accent"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <label className="flex w-full items-center gap-2 rounded-xl border border-black/10 bg-primary px-4 py-3 md:w-[320px]">
            <Search size={18} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-base text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </label>
        </div>

        <div className="p-5 md:p-7">
          {loading ? (
            <p className="text-sm text-text-secondary">Loading calendar...</p>
          ) : (
            <>
              <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm font-semibold text-text-secondary">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-7 gap-2">
                    {row.map((day, dayIndex) => {
                      if (!day) {
                        return (
                          <div
                            key={`${rowIndex}-${dayIndex}`}
                            className="h-[92px] rounded-xl bg-primary/50"
                          />
                        );
                      }

                      const date = new Date(year, month, day);
                      const key = toDateKey(date);
                      const events = eventsByDate.get(key) || [];
                      const hasEvent = events.length > 0;
                      const isSelected = selectedDateKey === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedDateKey(key)}
                          className={`h-[92px] rounded-xl border p-2 text-left transition-all ${
                            isSelected
                              ? "border-accent bg-accent text-white shadow-[0_10px_20px_rgba(229,9,20,0.28)]"
                              : hasEvent
                                ? "border-accent/40 bg-accent/5 hover:border-accent"
                                : "border-black/5 bg-primary/50 hover:border-accent/40"
                          }`}
                        >
                          <p className={`text-3xl font-semibold ${isSelected ? "text-white" : "text-text-primary"} `}>
                            {day}
                          </p>
                          {hasEvent && (
                            <p
                              className={`mt-1 line-clamp-1 text-sm ${
                                isSelected ? "text-white" : "text-accent"
                              }`}
                              title={events[0].title}
                            >
                              {events[0].title}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MovieCalendar;
