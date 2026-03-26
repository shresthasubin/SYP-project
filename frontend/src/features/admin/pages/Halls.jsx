import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
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
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  MapPin,
  Phone,
  Users,
  Armchair,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import LocationPickerMap from "../../../shared/components/LocationPickerMap.jsx";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api";
import { useAuth } from "../../../shared/hooks/useAuth.js";

const createRoom = () => ({
  roomName: "",
  rows: 5,
  seatsPerRow: 10,
  emptySeats: [],
  seatTypes: {},
});

const emptyForm = {
  hall_name: "",
  hall_location: "",
  hall_contact: "",
  license: "",
  hallPoster: null,
};

const seatKey = (rowIndex, seatIndex) => `${rowIndex}-${seatIndex}`;

const getRoomsFromHallPayload = (hall) => {
  if (Array.isArray(hall?.Hallrooms)) return hall.Hallrooms;
  if (Array.isArray(hall?.hallrooms)) return hall.hallrooms;
  return [];
};

const getRoomCapacity = (room) => {
  const rows = Number(room?.rows ?? room?.totalRows ?? 0) || 0;
  const seatsPerRow = Number(room?.seatsPerRow ?? room?.columns ?? room?.totalColumns ?? 0) || 0;
  const blockedSeats = Array.isArray(room?.emptySeats) ? room.emptySeats.length : 0;
  return Math.max(rows * seatsPerRow - blockedSeats, 0);
};

const normalizeRoomList = (hallrooms = []) => {
  if (!hallrooms.length) return [createRoom()];

  return hallrooms.map((room) => ({
    roomName: room?.roomName || room?.name || "",
    rows: Number(room?.rows ?? room?.totalRows ?? 5) || 5,
    seatsPerRow: Number(room?.seatsPerRow ?? room?.columns ?? room?.totalColumns ?? 10) || 10,
    emptySeats: Array.isArray(room?.emptySeats) ? room.emptySeats : [],
    seatTypes: room?.seatTypes && typeof room.seatTypes === "object" ? room.seatTypes : {},
  }));
};

const fetchHallrooms = async () => {
  try {
    return await axios.get(`${API_BASE_URL}/hallroom/get`, {
      withCredentials: true,
    });
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    return axios.get(`${API_BASE_URL}/hall-room/get`, {
      withCredentials: true,
    });
  }
};

const Halls = () => {
  const { user } = useAuth();
  const isHallAdmin = user?.role === "hall-admin";
  const [halls, setHalls] = useState([]);
  const [hallRooms, setHallRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingHall, setEditingHall] = useState(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(emptyForm);
  const [rooms, setRooms] = useState([createRoom()]);
  const [seatBrush, setSeatBrush] = useState("regular");
  const [error, setError] = useState("");
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const steps = ["Basic Info", "Location", "Rooms", "Seat Layout"];

  useEffect(() => {
    fetchHalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHallAdmin]);

  const totalCapacity = useMemo(
    () =>
      rooms.reduce((sum, room) => {
        const total = Number(room.rows) * Number(room.seatsPerRow);
        return sum + Math.max(total - room.emptySeats.length, 0);
      }, 0),
    [rooms],
  );

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const [hallsResponse, hallRoomsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}${isHallAdmin ? "/hall/get" : "/hall/get-active"}`, {
          withCredentials: true,
        }),
        fetchHallrooms(),
      ]);

      if (hallsResponse.data.success) {
        setHalls(hallsResponse.data.data);
      }

      if (hallRoomsResponse.data?.success) {
        setHallRooms(hallRoomsResponse.data.data || []);
      }
    } catch {
      toast.error("Failed to fetch halls");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, hallPoster: file }));
  };

  const updateRoom = (index, patch) => {
    setRooms((prev) => prev.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  };

  const addRoom = () => setRooms((prev) => [...prev, createRoom()]);
  const removeRoom = (index) => setRooms((prev) => prev.filter((_, i) => i !== index));

  const applySeatBrush = (roomIndex, rowIndex, colIndex) => {
    const key = seatKey(rowIndex, colIndex);
    const room = rooms[roomIndex];
    const emptySet = new Set(room.emptySeats);
    const seatTypes = { ...(room.seatTypes || {}) };

    if (seatBrush === "blocked") {
      emptySet.add(key);
      delete seatTypes[key];
    } else {
      emptySet.delete(key);
      seatTypes[key] = seatBrush === "premium" ? "premium" : "regular";
    }

    updateRoom(roomIndex, { emptySeats: Array.from(emptySet), seatTypes });
  };

  const validateStep = () => {
    if (editingHall) {
      if (step === 0) {
        return formData.hall_name.trim() && formData.hall_contact.trim() && formData.license.trim();
      }
      if (step === 1) return formData.hall_location.trim();
      return true;
    }

    if (step === 0) {
      return formData.hall_name.trim() && formData.hall_contact.trim() && formData.license.trim();
    }
    if (step === 1) return formData.hall_location.trim();
    if (step === 2) return rooms.length > 0 && rooms.every((r) => r.roomName.trim() && r.rows > 0 && r.seatsPerRow > 0);
    if (step === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
    const lastStep = editingHall ? 1 : steps.length - 1;

    if (step < lastStep) {
      return;
    }

    setError("");
    const data = new FormData();
    data.append("hall_name", formData.hall_name);
    data.append("hall_location", formData.hall_location);
    data.append("hall_contact", formData.hall_contact);
    if (!editingHall || !isHallAdmin) {
      data.append("license", formData.license);
    }
    if (formData.hallPoster) data.append("hallPoster", formData.hallPoster);

    try {
      if (editingHall) {
        await axios.put(`${API_BASE_URL}/hall/update/${editingHall.id}`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hall updated successfully");
      } else {
        data.append("hallrooms", JSON.stringify(rooms));
        data.append("totalCapacity", String(totalCapacity));
        await axios.post(`${API_BASE_URL}/hall/register`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hall registered successfully");
      }
      closeModal();
      fetchHalls();
    } catch (err) {
      console.error("Hall register/update failed:", err.response?.data || err.message);
      const detailMessage = err.response?.data?.details?.[0]?.message;
      const msg = detailMessage || err.response?.data?.error || err.response?.data?.message || "Operation failed";
      setError(msg);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deactivateTarget?.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/hall/delete/${deactivateTarget.id}`, { withCredentials: true });
      toast.success("Hall deactivated successfully");
      setDeactivateTarget(null);
      fetchHalls();
    } catch {
      toast.error("Failed to deactivate hall");
    }
  };

  const handleActivate = async (hall) => {
    try {
      const data = new FormData();
      data.append("isActive", "true");
      await axios.put(`${API_BASE_URL}/hall/update/${hall.id}`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Hall activated successfully");
      fetchHalls();
    } catch {
      toast.error("Failed to activate hall");
    }
  };

  const getPosterUrl = (poster) => {
    if (!poster) return "";
    // If backend already returns an absolute URL, use it as-is.
    if (/^https?:\/\//i.test(poster)) return poster;
    // Avoid double "uploads/uploads" cases.
    const normalized = poster.replace(/^\/+/, "").replace(/^uploads\//, "");
    return `${API_SERVER_URL}/uploads/${normalized}`;
  };

  const openCreateModal = () => {
    resetForm();
    setStep(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getHallMeta = (hall) => {
    const roomsFromHall = getRoomsFromHallPayload(hall);
    const roomsFromEndpoint = hallRooms.filter((room) => {
      const roomHallId = room?.Hall?.id ?? room?.hallId ?? room?.HallId;
      return String(roomHallId) === String(hall?.id);
    });
    const resolvedRooms = roomsFromEndpoint.length ? roomsFromEndpoint : roomsFromHall;
    const derivedSeatCount = resolvedRooms.reduce((sum, room) => sum + getRoomCapacity(room), 0);

    return {
      roomCount: resolvedRooms.length || Number(hall?.roomsCount) || 0,
      seatCount: derivedSeatCount || Number(hall?.capacity ?? hall?.totalCapacity) || 0,
      status: hall?.isActive ? "Active" : "Inactive",
    };
  };

  const openEditModal = (hall) => {
    setEditingHall(hall);
    setFormData({
      hall_name: hall.hall_name || "",
      hall_location: hall.hall_location || "",
      hall_contact: hall.hall_contact || "",
      license: hall.license || "",
      hallPoster: null,
    });
    setRooms([createRoom()]);
    setStep(0);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setRooms([createRoom()]);
    setEditingHall(null);
    setStep(0);
    setError("");
  };

  const filteredHalls = halls.filter((hall) =>
    (hall.hall_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentPosterUrl = editingHall?.hallPoster ? getPosterUrl(editingHall.hallPoster) : "";

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" mb={2.5}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{isHallAdmin ? "My Hall" : "Halls"}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {isHallAdmin ? "Manage the hall assigned to your hall admin account" : "Manage your cinema halls"}
          </Typography>
        </Box>
        {!isHallAdmin ? (
          <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={openCreateModal}>
            Add Hall
          </Button>
        ) : null}
      </Stack>

      <Paper sx={{ p: 1.5, mb: 2.5, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <TextField
          fullWidth
          placeholder="Search halls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 1.5 }}>
        {loading ? (
          <LinearProgress color="primary" />
        ) : filteredHalls.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">No halls found</Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {filteredHalls.map((hall) => {
              const meta = getHallMeta(hall);
              return (
                <Grid size={12} key={hall.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "row",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      bgcolor: "rgba(255,255,255,0.015)",
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: { xs: 120, sm: 150 },
                        minWidth: { xs: 120, sm: 150 },
                        flexShrink: 0,
                      }}
                    >
                      {hall.hallPoster ? (
                        <CardMedia
                          component="img"
                          image={getPosterUrl(hall.hallPoster)}
                          alt={hall.hall_name}
                          sx={{
                            height: "100%",
                            minHeight: 220,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: "100%",
                            minHeight: 220,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "background.default",
                          }}
                        >
                          <MapPin size={36} />
                        </Box>
                      )}

                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.82) 100%)",
                        }}
                      />

                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ position: "absolute", inset: 0, p: 1 }}>
                        <Chip
                          label={meta.status}
                          color={hall.isActive ? "success" : "warning"}
                          size="small"
                          variant={hall.isActive ? "filled" : "outlined"}
                          sx={{ height: 22, fontSize: 11 }}
                        />
                        <Chip
                          label={`${meta.roomCount} room${meta.roomCount === 1 ? "" : "s"}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: 11, bgcolor: "rgba(0,0,0,0.3)" }}
                        />
                      </Stack>

                      <Box sx={{ position: "absolute", left: 0, right: 0, bottom: 0, p: 1.25 }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.15 }}>
                          {hall.hall_name}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.72)" sx={{ mt: 0.35, display: "block" }}>
                          {hall.license || "License pending"}
                        </Typography>
                      </Box>
                    </Box>

                    <CardContent sx={{ flex: 1, p: 1.75, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          <Chip
                            icon={<Users size={14} />}
                            label={`${meta.seatCount || 0} seats`}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                          <Chip
                            label={`${meta.roomCount} room${meta.roomCount === 1 ? "" : "s"}`}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                        </Stack>

                        <Stack spacing={1.1}>
                          <Stack direction="row" spacing={1.1} alignItems="flex-start">
                            <MapPin size={15} />
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                              {hall.hall_location || "Location unavailable"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1.1} alignItems="center">
                            <Phone size={15} />
                            <Typography variant="body2" color="text.secondary">
                              {hall.hall_contact || "N/A"}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit2 size={14} />}
                          onClick={() => openEditModal(hall)}
                          sx={{ px: 1.5, flex: 1, borderRadius: 1 }}
                        >
                          Edit Hall
                        </Button>
                        {!isHallAdmin ? (
                          hall.isActive ? (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Trash2 size={14} />}
                              onClick={() => setDeactivateTarget({ id: hall.id, name: hall.hall_name })}
                              sx={{ px: 1.5, flex: 1, borderRadius: 1 }}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              startIcon={<CheckCircle2 size={14} />}
                              onClick={() => handleActivate(hall)}
                              sx={{ px: 1.5, flex: 1, borderRadius: 1 }}
                            >
                              Activate
                            </Button>
                          )
                        ) : null}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      <Dialog open={showModal} onClose={closeModal} fullWidth maxWidth="lg">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{editingHall ? "Edit Hall" : "Add New Hall"}</Typography>
            <Typography variant="body2" color="text.secondary">
              Step {step + 1} of {editingHall ? 2 : steps.length}
            </Typography>
          </Box>
          <IconButton onClick={closeModal}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <Divider />
        {error && <Alert severity="error" sx={{ mx: 3, mt: 2 }}>{error}</Alert>}
        <DialogContent dividers sx={{ pt: 3 }}>
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
            {(editingHall ? steps.slice(0, 2) : steps).map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form id="hall-form" onSubmit={(e) => e.preventDefault()}>
            {step === 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Hall Name"
                    name="hall_name"
                    fullWidth
                    value={formData.hall_name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Contact"
                    name="hall_contact"
                    fullWidth
                    value={formData.hall_contact}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="License Number"
                    name="license"
                    fullWidth
                    value={formData.license}
                    onChange={handleInputChange}
                    disabled={isHallAdmin && Boolean(editingHall)}
                    helperText={isHallAdmin && editingHall ? "Hall admins can view license details but cannot change them." : ""}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload size={16} />}
                    fullWidth
                  >
                    {formData.hallPoster ? formData.hallPoster.name : editingHall ? "Replace Hall Poster" : "Upload Hall Poster"}
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                  {(currentPosterUrl && !formData.hallPoster) && (
                    <Box sx={{ mt: 1, border: "1px solid", borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
                      <img
                        src={currentPosterUrl}
                        alt={editingHall?.hall_name}
                        style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 1, py: 0.5 }}>
                        Current poster
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}

            {step === 1 && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Hall Location"
                  name="hall_location"
                  fullWidth
                  value={formData.hall_location}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <LocationPickerMap
                  key={`${editingHall ? "edit" : "create"}-${showModal ? "open" : "closed"}`}
                  locationValue={formData.hall_location}
                  onLocationSelect={(nextLocation) =>
                    setFormData((prev) => ({ ...prev, hall_location: nextLocation }))
                  }
                />
              </Box>
            )}

            {!editingHall && step === 2 && (
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography fontWeight={700}>Hall Rooms</Typography>
                  <Button size="small" variant="outlined" onClick={addRoom}>+ Add Room</Button>
                </Stack>
                <Stack spacing={2}>
                  {rooms.map((room, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            label="Room Name"
                            value={room.roomName}
                            onChange={(e) => updateRoom(idx, { roomName: e.target.value })}
                            fullWidth
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4 }}>
                          <TextField
                            label="Rows"
                            type="number"
                            value={room.rows}
                            onChange={(e) =>
                              updateRoom(idx, {
                                rows: Number(e.target.value) || 1,
                                emptySeats: [],
                                seatTypes: {},
                              })
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4 }}>
                          <TextField
                            label="Seats per Row"
                            type="number"
                            value={room.seatsPerRow}
                            onChange={(e) =>
                              updateRoom(idx, {
                                seatsPerRow: Number(e.target.value) || 1,
                                emptySeats: [],
                                seatTypes: {},
                              })
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                      {rooms.length > 1 && (
                        <Button
                          size="small"
                          color="error"
                          sx={{ mt: 1 }}
                          onClick={() => removeRoom(idx)}
                        >
                          Remove room
                        </Button>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {!editingHall && step === 3 && (
              <Box sx={{ mb: 1 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Calculated total capacity: {totalCapacity}
                </Alert>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">Brush:</Typography>
                  {["regular", "premium", "blocked"].map((brush) => (
                    <Chip
                      key={brush}
                      label={brush.charAt(0).toUpperCase() + brush.slice(1)}
                      color={seatBrush === brush ? "primary" : "default"}
                      variant={seatBrush === brush ? "filled" : "outlined"}
                      onClick={() => setSeatBrush(brush)}
                      size="small"
                    />
                  ))}
                </Stack>
                <Stack spacing={2}>
                  {rooms.map((room, roomIndex) => {
                    const rows = Number(room.rows);
                    const seats = Number(room.seatsPerRow);
                    const available = rows * seats - room.emptySeats.length;
                    return (
                      <Paper key={roomIndex} variant="outlined" sx={{ p: 2 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography fontWeight={700}>{room.roomName || `Room ${roomIndex + 1}`}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {available}/{rows * seats} available
                          </Typography>
                        </Stack>
                        <Box sx={{ overflowX: "auto" }}>
                          <Stack spacing={1}>
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                              <Stack key={rowIndex} direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" sx={{ width: 16 }}>
                                  {String.fromCharCode(65 + rowIndex)}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                  {Array.from({ length: seats }).map((__, colIndex) => {
                                    const key = seatKey(rowIndex, colIndex);
                                    const isEmpty = room.emptySeats.includes(key);
                                    const seatType = room.seatTypes?.[key] === "premium" ? "premium" : "regular";
                                    return (
                                      <IconButton
                                        key={key}
                                        size="small"
                                        onClick={() => applySeatBrush(roomIndex, rowIndex, colIndex)}
                                        sx={{ p: 0.5 }}
                                        title={`${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`}
                                      >
                                        <Armchair
                                          size={16}
                                          className={
                                            isEmpty
                                              ? "text-slate-500"
                                              : seatType === "premium"
                                                ? "text-amber-400"
                                                : "text-pink-400"
                                          }
                                        />
                                      </IconButton>
                                    );
                                  })}
                                </Stack>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button type="button" onClick={closeModal} color="inherit">Cancel</Button>
          {step > 0 && (
            <Button type="button" variant="outlined" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
          )}
          {step < (editingHall ? 1 : steps.length - 1) ? (
            <Button
              key="next-step"
              type="button"
              variant="contained"
              onClick={() => {
                if (!validateStep()) return;
                setStep((s) => s + 1);
              }}
            >
              Next
            </Button>
          ) : (
            <Button
              key="submit-hall"
              type="button"
              variant="contained"
              onClick={handleSubmit}
            >
              {editingHall ? "Update Hall" : "Create Hall"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Deactivate Hall</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to deactivate
            <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
              {" "}{deactivateTarget?.name || "this hall"}
            </Box>
            ? You can activate it again later if needed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeactivateTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Halls;
