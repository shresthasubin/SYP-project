import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, Heart, MapPin, MessageCircle, Play, Star, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MovieDetailPanel({
  movie,
  genreLabel,
  groupedByHallroom,
  uniqueDates,
  activeDate,
  onDateChange,
  onOpenBooking,
  onOpenChat,
  formatDuration,
  getPosterUrl,
  getCastImageUrl,
  getTrailerUrl,
  prettyDateChip,
}) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const castNames = Array.isArray(movie.casts)
    ? movie.casts
    : typeof movie.casts === "string"
      ? movie.casts.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
  const castImages = Array.isArray(movie.castImages) ? movie.castImages : [];
  const trailerUrl = getTrailerUrl(movie.movieTrailer);

  return (
    <>
      <div className="relative h-[500px] overflow-hidden border-b border-white/10">
        <img src={getPosterUrl(movie.moviePoster)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a0a] via-[#10101a] to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0a0a0a] to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end gap-8 px-4 pb-10 md:px-6">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="bg-[#e8001c] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Now Showing</span>
              <span className="text-xs uppercase tracking-wider text-gray-400">
                {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "TBA"} | {genreLabel}
              </span>
            </div>

            <h1 className="text-4xl font-black uppercase tracking-[0.12em] drop-shadow-[0_0_18px_rgba(232,0,28,0.35)] md:text-6xl">
              {movie.movie_title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="inline-flex items-center gap-1"><Clock3 size={15} />{formatDuration(movie.duration)}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={15} />{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : "TBA"}</span>
              <span className="inline-flex items-center gap-1"><Star size={15} className="text-[#f5c518]" fill="currentColor" />{Number(movie.rating) || "N/A"}</span>
            </div>
          </div>

          <div className="ml-auto hidden items-end gap-4 lg:flex">
            <img src={getPosterUrl(movie.moviePoster)} alt={movie.movie_title} className="h-48 w-32 rounded border-2 border-white/10 object-cover shadow-2xl" />
            <div className="relative h-48 w-80 overflow-hidden rounded border-2 border-white/10 bg-black">
              <img src={getPosterUrl(movie.moviePoster)} alt="Trailer cover" className="h-full w-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!trailerUrl) {
                      toast.error("Trailer is not available");
                      return;
                    }
                    setIsTrailerOpen(true);
                  }}
                  className="rounded-full bg-[#e8001c] p-4 text-white shadow-[0_0_24px_rgba(232,0,28,0.35)]"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
              <span className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Watch Trailer</span>
            </div>
          </div>
        </div>
      </div>

      {isTrailerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="relative w-full max-w-4xl rounded-lg border border-white/10 bg-black p-3">
            <button
              type="button"
              onClick={() => setIsTrailerOpen(false)}
              className="mb-3 rounded border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10"
            >
              Close
            </button>
            <video
              key={trailerUrl}
              controls
              autoPlay
              className="h-full max-h-[70vh] w-full rounded bg-black"
              src={trailerUrl}
            />
          </div>
        </div>
      )}

      <div className="border-b border-white/10 bg-[#111111]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1fr_260px]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#e8001c]">Summary</p>
            <p className="font-[Barlow] text-sm leading-7 text-gray-300">
              {movie.description || "No description available for this movie."}
            </p>
            <div className="mt-6 flex flex-wrap gap-10 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Director</p>
                <p className="mt-1 text-gray-300">{movie.director || "Not available"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Writers</p>
                <p className="mt-1 text-gray-300">{movie.writer || "Not available"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">Casts</p>
                {castNames.length === 0 ? (
                  <p className="mt-1 text-gray-300">Not available</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {castNames.map((name, index) => (
                      <div key={`${name}-${index}`} className="flex items-center gap-2 rounded border border-white/10 bg-black/30 px-2 py-1">
                        <img
                          src={getCastImageUrl(castImages[index])}
                          alt={name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="text-xs text-gray-300">{name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const first = groupedByHallroom?.[0]?.times?.[0]?.id;
                if (!first) {
                  toast.error("No showtimes available right now");
                  return;
                }
                onOpenBooking(first);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#e8001c] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_8px_20px_rgba(232,0,28,0.25)] hover:bg-[#b0001a]"
            >
              <Ticket size={15} />
              Get Ticket
            </button>
            <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-300 hover:border-[#e8001c] hover:text-[#e8001c]">
              <Heart size={15} />
              Add to Favorites
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-[0.18em]">Showtimes</h2>
          <Link to="/movies" className="text-xs font-bold uppercase tracking-[0.16em] text-[#e8001c]">Back to movies</Link>
        </div>

        {uniqueDates.length === 0 ? (
          <div className="rounded border border-white/10 bg-[#141414] p-4 text-sm text-gray-300">No showtimes are listed for this movie yet.</div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {uniqueDates.map((dateKey) => (
                <button
                  key={dateKey}
                  onClick={() => onDateChange(dateKey)}
                  className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                    (activeDate || uniqueDates[0]) === dateKey
                      ? "border-[#e8001c] bg-[#e8001c]/10 text-[#e8001c]"
                      : "border-white/15 bg-black/30 text-gray-300 hover:border-white/35"
                  }`}
                >
                  {prettyDateChip(dateKey)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {groupedByHallroom.map((group) => (
                <article key={`${group.hallName}-${group.roomName}`} className="rounded border border-white/10 bg-[#161616] p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold uppercase tracking-wide">{group.hallName}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-gray-400"><MapPin size={14} />{group.hallLocation}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">{group.roomName}</p>
                    </div>

                    <button
                      onClick={() => onOpenChat(group)}
                      disabled={!group.hallId}
                      className="inline-flex items-center gap-1 rounded border border-[#e8001c]/40 bg-[#e8001c]/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#e8001c] hover:bg-[#e8001c]/20 disabled:opacity-50"
                    >
                      <MessageCircle size={14} />
                      Chat with Hall
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.times.map((time) => (
                      <button key={time.id} onClick={() => onOpenBooking(time.id)} className="rounded border border-white/20 bg-black/30 px-3 py-1.5 text-sm text-white hover:border-[#e8001c] hover:text-[#e8001c]">
                        {time.start}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

    </>
  );
}
