import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CalendarDays, Clock3, Edit2, Plus, Search, Trash2, X } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";

const toInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toInputTime = (value) => (value ? String(value).slice(0, 5) : "");
const formatTime = (value) => (value ? String(value).slice(0, 5) : "--:--");
const todayString = () => new Date().toISOString().slice(0, 10);

const defaultStartTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(Math.ceil(now.getMinutes() / 5) * 5).padStart(2, "0");
  return `${hour}:${minute === "60" ? "00" : minute}`;
};

const fetchHallrooms = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/hallroom/get`, { withCredentials: true });
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    return axios.get(`${API_BASE_URL}/hall-room/get`, { withCredentials: true });
  }
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

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
        fetchHallrooms(),
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
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load movies/hallrooms");
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
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error;
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
      setError("");
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create showtime");
      toast.error(err.response?.data?.message || "Failed to create showtime");
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
      setError("");
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update showtime");
      toast.error(err.response?.data?.message || "Failed to update showtime");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/showtime/delete/${deleteTarget.id}`, {
        withCredentials: true,
      });
      toast.success("Showtime deleted");
      setDeleteTarget(null);
      await fetchShowtimes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete showtime");
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

  const todayCount = useMemo(() => {
    const today = todayString();
    return showtimes.filter((item) => (item.show_date || "") === today).length;
  }, [showtimes]);

  const selectedCreateMovie = useMemo(
    () => movies.find((movie) => String(movie.id) === String(createForm.movieId)) || null,
    [movies, createForm.movieId],
  );

  const selectedCreateRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(createForm.hallroomId)) || null,
    [rooms, createForm.hallroomId],
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
          >
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: "0.16em", color: "text.secondary" }}>
                Scheduling
              </Typography>
              <Typography variant="h4" fontWeight={800}>Showtime Management</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.75}>
                {user?.role === "hall-admin"
                  ? "Manage schedules for your hallrooms."
                  : "Create, update, and remove movie schedules by hallroom."}
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ width: { xs: "100%", lg: "auto" } }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  border: "1px solid",
                  borderColor: "divider",
                  minWidth: { xs: "100%", sm: 280 },
                }}
              >
                {[
                  { label: "Total", value: showtimes.length },
                  { label: "Today", value: todayCount },
                  { label: "Upcoming", value: upcomingCount },
                ].map((item, index) => (
                  <Box
                    key={item.label}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderLeft: index === 0 ? "none" : "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={openCreateModal}
                disabled={movies.length === 0 || rooms.length === 0}
                sx={{
                  borderRadius: 1,
                  px: 2.5,
                  minHeight: 48,
                  whiteSpace: "nowrap",
                }}
              >
                Add Showtime
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={1.5}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
              <Typography variant="body2" color="text.secondary">
                Narrow the schedule list by movie, room, or date.
              </Typography>
            </Box>
            {hasActiveFilters ? (
              <Button variant="text" size="small" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : null}
          </Stack>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by movie, hall, room, date..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField select fullWidth size="small" value={filterMovieId} onChange={(e) => setFilterMovieId(e.target.value)}>
                <MenuItem value="">All Movies</MenuItem>
                {movies.map((movie) => (
                  <MenuItem key={movie.id} value={movie.id}>
                    {movie.movie_title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField select fullWidth size="small" value={filterHallroomId} onChange={(e) => setFilterHallroomId(e.target.value)}>
                <MenuItem value="">All Hallrooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.Hall?.hall_name ? `${room.Hall.hall_name} - ` : ""}{room.roomName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarDays size={16} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button variant="outlined" size="small" onClick={() => setFilterDate(todayString())} sx={{ width: "100%", borderRadius: 1, minHeight: 40 }}>
                Today
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, py: 1.75, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700}>Schedule List</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === "hall-admin"
              ? "All showtimes for your managed rooms."
              : "All scheduled shows across movies and hallrooms."}
          </Typography>
        </Box>
        {loading ? (
          <LinearProgress />
        ) : filteredByQuery.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center", px: 3 }}>
            <Typography variant="h6" color="text.primary">No showtimes found</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Adjust your filters or create a new schedule.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1.5, fontWeight: 700 }}>Movie</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 700 }}>Hall / Room</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 700 }}>Start</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 700 }}>End</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredByQuery.map((showtime) => (
                  <TableRow
                    hover
                    key={showtime.id}
                    sx={{
                      "& td": { py: 1.75 },
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{showtime.Movie?.movie_title || "Unknown movie"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {(showtime.Hallroom?.Hall?.hall_name || "Unknown hall") + " / " + (showtime.Hallroom?.roomName || "Unknown room")}
                    </TableCell>
                    <TableCell>{showtime.show_date || "N/A"}</TableCell>
                    <TableCell>{formatTime(showtime.start_time)}</TableCell>
                    <TableCell>{formatTime(showtime.end_time)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton size="small" color="primary" onClick={() => openEditModal(showtime)}>
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteTarget({
                              id: showtime.id,
                              movie: showtime.Movie?.movie_title || "this showtime",
                              date: showtime.show_date || "",
                              time: formatTime(showtime.start_time),
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Create Showtime</Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the schedule details and create the show.
            </Typography>
          </Box>
          <IconButton onClick={() => setShowCreateModal(false)}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <Divider />
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        <DialogContent dividers>
          <form id="create-showtime-form" onSubmit={handleCreate}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Movie"
                  value={createForm.movieId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, movieId: e.target.value }))}
                  fullWidth
                  required
                >
                  {movies.map((movie) => (
                    <MenuItem key={movie.id} value={movie.id}>
                      {movie.movie_title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Hallroom"
                  value={createForm.hallroomId}
                  onChange={(e) => setCreateForm((p) => ({ ...p, hallroomId: e.target.value }))}
                  fullWidth
                  required
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.Hall?.hall_name ? `${room.Hall.hall_name} - ` : ""}{room.roomName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Show Date"
                  type="date"
                  value={createForm.show_date}
                  onChange={(e) => setCreateForm((p) => ({ ...p, show_date: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ inputProps: { min: todayString() } }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={createForm.start_time}
                  onChange={(e) => setCreateForm((p) => ({ ...p, start_time: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 0.5,
                    px: 2,
                    py: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Preview</Typography>
                  <Typography variant="body2" sx={{ mt: 0.75 }}>
                    {selectedCreateMovie?.movie_title || "Select a movie"}{" "}
                    {selectedCreateRoom ? `in ${selectedCreateRoom?.Hall?.hall_name || ""} / ${selectedCreateRoom?.roomName || ""}` : "in a hallroom"}{" "}
                    {createForm.show_date && createForm.start_time ? `on ${createForm.show_date} at ${createForm.start_time}` : "with a date and time"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={() => setShowCreateModal(false)} color="inherit">Cancel</Button>
          <Button type="submit" form="create-showtime-form" variant="contained" disabled={saving} sx={{ borderRadius: 1, px: 2.5 }}>
            {saving ? "Saving..." : "Create Showtime"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editingShowtime)} onClose={closeEditModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>Edit Showtime</Typography>
            <Typography variant="body2" color="text.secondary">
              Update the schedule timing.
            </Typography>
          </Box>
          <IconButton onClick={closeEditModal}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <Divider />
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        <DialogContent dividers>
          <form id="edit-showtime-form" onSubmit={handleUpdate}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Show Date"
                  type="date"
                  value={editForm.show_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, show_date: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={editForm.start_time}
                  onChange={(e) => setEditForm((p) => ({ ...p, start_time: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={closeEditModal} color="inherit">Cancel</Button>
          <Button type="submit" form="edit-showtime-form" variant="contained" disabled={saving} sx={{ borderRadius: 1, px: 2.5 }}>
            {saving ? "Saving..." : "Update Showtime"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Showtime</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              {" "}{deleteTarget?.movie || "this showtime"}
            </Box>
            {deleteTarget?.date ? ` on ${deleteTarget.date}` : ""}
            {deleteTarget?.time ? ` at ${deleteTarget.time}` : ""}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Showtimes;
