import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { CalendarDays, Clock3, Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { API_BASE_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toInputTime = (value) => {
  if (!value) return "";
  return String(value).slice(0, 5);
};

const formatTime = (value) => (value ? String(value).slice(0, 5) : "--:--");
const todayString = () => new Date().toISOString().slice(0, 10);

const defaultStartTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(Math.ceil(now.getMinutes() / 5) * 5).padStart(2, "0");
  return `${hour}:${minute === "60" ? "00" : minute}`;
};

const Showtimes = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filterMovieId, setFilterMovieId] = useState("");
  const [filterHallroomId, setFilterHallroomId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);

  const [createForm, setCreateForm] = useState({
    movieId: "",
    hallroomId: "",
    show_date: "",
    start_time: "",
  });

  const [editForm, setEditForm] = useState({
    show_date: "",
    start_time: "",
  });
  const hasActiveFilters = Boolean(filterMovieId || filterHallroomId || filterDate || query.trim());

  const fetchBaseData = async () => {
    try {
      const [moviesRes, roomsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/movie/get`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/hall-room/get`, { withCredentials: true }),
      ]);

      const moviesData = moviesRes.data?.success ? moviesRes.data.data || [] : [];
      const roomsData = roomsRes.data?.success ? roomsRes.data.data || [] : [];

      setMovies(moviesData);
      setRooms(roomsData);

      setCreateForm((prev) => ({
        ...prev,
        movieId: prev.movieId || (moviesData[0]?.id ? String(moviesData[0].id) : ""),
        hallroomId: prev.hallroomId || (roomsData[0]?.id ? String(roomsData[0].id) : ""),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load movies/hallrooms");
    }
  };

  const fetchShowtimes = async () => {
    try {
      const params = {};
      if (filterMovieId) params.movieId = filterMovieId;
      if (filterHallroomId) params.hallroomId = filterHallroomId;
      if (filterDate) params.showDate = filterDate;

      const response = await axios.get(`${API_BASE_URL}/showtime/get`, {
        params,
        withCredentials: true,
      });

      if (response.data?.success) {
        setShowtimes(response.data.data || []);
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      toast.error(apiMessage || "Failed to fetch showtimes");
    }
  };

  useEffect(() => {
    const init = async () => {
      if (authLoading) return;
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      await fetchBaseData();
      setInitialized(true);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    fetchShowtimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, isAuthenticated, filterMovieId, filterHallroomId, filterDate]);

  const openEditModal = (showtime) => {
    setEditingShowtime(showtime);
    setEditForm({
      show_date: toInputDate(showtime.show_date),
      start_time: toInputTime(showtime.start_time),
    });
  };

  const closeEditModal = () => {
    setEditingShowtime(null);
    setEditForm({ show_date: "", start_time: "" });
  };

  const openCreateModal = () => {
    setCreateForm((prev) => ({
      ...prev,
      show_date: prev.show_date || todayString(),
      start_time: prev.start_time || defaultStartTime(),
    }));
    setShowCreateModal(true);
  };

  const clearFilters = () => {
    setQuery("");
    setFilterMovieId("");
    setFilterHallroomId("");
    setFilterDate("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.movieId || !createForm.hallroomId || !createForm.show_date || !createForm.start_time) {
      toast.error("All create fields are required");
      return;
    }

    try {
      setSaving(true);
      await axios.post(
        `${API_BASE_URL}/showtime/create-showtime/${createForm.movieId}/${createForm.hallroomId}`,
        {
          show_date: createForm.show_date,
          start_time: createForm.start_time,
        },
        { withCredentials: true },
      );
      toast.success("Showtime created");
      setShowCreateModal(false);
      await fetchShowtimes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create showtime");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingShowtime) return;
    if (!editForm.show_date || !editForm.start_time) {
      toast.error("Both date and time are required");
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        `${API_BASE_URL}/showtime/update-showtime/${editingShowtime.id}`,
        {
          show_date: editForm.show_date,
          start_time: editForm.start_time,
        },
        { withCredentials: true },
      );
      toast.success("Showtime updated");
      closeEditModal();
      await fetchShowtimes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update showtime");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (showtimeId) => {
    if (!window.confirm("Delete this showtime?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/showtime/delete/${showtimeId}`, {
        withCredentials: true,
      });
      toast.success("Showtime deleted");
      await fetchShowtimes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete showtime");
    }
  };

  const filteredByQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return showtimes;
    return showtimes.filter((showtime) => {
      const movieTitle = showtime.Movie?.movie_title || "";
      const roomName = showtime.Hallroom?.roomName || "";
      const hallName = showtime.Hallroom?.Hall?.hall_name || "";
      return [movieTitle, roomName, hallName, showtime.show_date].join(" ").toLowerCase().includes(q);
    });
  }, [query, showtimes]);

  const upcomingCount = useMemo(() => {
    const today = todayString();
    return showtimes.filter((item) => (item.show_date || "") >= today).length;
  }, [showtimes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Showtime Management</h1>
          <p className="mt-1 text-slate-400">
            {user?.role === "hall-admin"
              ? "Manage schedules for your hallrooms."
              : "Create, update, and remove movie schedules by hallroom."}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Total: {showtimes.length} | Upcoming: {upcomingCount}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={movies.length === 0 || rooms.length === 0}
          className="flex items-center gap-2 rounded-lg bg-[#D72626] px-4 py-2 font-semibold text-white hover:bg-[#D72626]/90"
        >
          <Plus size={18} />
          Add Showtime
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by movie, hall, room, date..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-3 text-sm text-white outline-none focus:border-[#D72626]"
          />
        </div>
        <select
          value={filterMovieId}
          onChange={(e) => setFilterMovieId(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
        >
          <option value="">All Movies</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.movie_title}
            </option>
          ))}
        </select>
        <select
          value={filterHallroomId}
          onChange={(e) => setFilterHallroomId(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
        >
          <option value="">All Hallrooms</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.Hall?.hall_name ? `${room.Hall.hall_name} - ` : ""}
              {room.roomName}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterDate(todayString())}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-[#D72626]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-40 hover:border-[#D72626]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-950">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading showtimes...</div>
        ) : filteredByQuery.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No showtimes found</div>
        ) : (
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">MOVIE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">HALL / ROOM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">DATE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">START</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">END</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredByQuery.map((showtime) => (
                <tr key={showtime.id} className="border-b border-slate-800 hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-sm text-white">{showtime.Movie?.movie_title || "Unknown movie"}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {(showtime.Hallroom?.Hall?.hall_name || "Unknown hall") + " / " + (showtime.Hallroom?.roomName || "Unknown room")}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{showtime.show_date || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatTime(showtime.start_time)}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatTime(showtime.end_time)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(showtime)}
                        className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-blue-400"
                        title="Edit showtime"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(showtime.id)}
                        className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                        title="Delete showtime"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create Showtime</h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Movie</label>
                <select
                  value={createForm.movieId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, movieId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
                >
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.movie_title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Hallroom</label>
                <select
                  value={createForm.hallroomId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, hallroomId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.Hall?.hall_name ? `${room.Hall.hall_name} - ` : ""}
                      {room.roomName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Show Date</label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="date"
                      value={createForm.show_date}
                      onChange={(e) => setCreateForm((p) => ({ ...p, show_date: e.target.value }))}
                      min={todayString()}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#D72626]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Start Time</label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="time"
                      value={createForm.start_time}
                      onChange={(e) => setCreateForm((p) => ({ ...p, start_time: e.target.value }))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#D72626]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#D72626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D72626]/90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Create Showtime"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingShowtime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Showtime</h2>
              <button onClick={closeEditModal} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Show Date</label>
                  <input
                    type="date"
                    value={editForm.show_date}
                    onChange={(e) => setEditForm((p) => ({ ...p, show_date: e.target.value }))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Start Time</label>
                  <input
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm((p) => ({ ...p, start_time: e.target.value }))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-[#D72626]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#D72626] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D72626]/90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update Showtime"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showtimes;
