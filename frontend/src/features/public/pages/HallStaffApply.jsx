import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Armchair,
  CheckCircle2,
  Upload,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { API_BASE_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";
import LocationPickerMap from "../../../shared/components/LocationPickerMap.jsx";

const steps = ["Details", "Location", "Hallrooms", "Seat Layout"];

const initialHall = {
  hall_name: "",
  hall_location: "",
  hall_contact: "",
  license: "",
  hallPoster: null,
};

const createRoom = () => ({
  roomName: "",
  rows: 5,
  seatsPerRow: 10,
  emptySeats: [],
  seatTypes: {},
});

const seatKey = (rowIndex, seatIndex) => `${rowIndex}-${seatIndex}`;

const HallStaffApply = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [hall, setHall] = useState(initialHall);
  const [rooms, setRooms] = useState([createRoom()]);
  const [seatBrush, setSeatBrush] = useState("regular");

  const totalCapacity = useMemo(
    () =>
      rooms.reduce((sum, room) => {
        const total = Number(room.rows) * Number(room.seatsPerRow);
        return sum + Math.max(total - room.emptySeats.length, 0);
      }, 0),
    [rooms],
  );
  

  const updateHall = (patch) => setHall((prev) => ({ ...prev, ...patch }));

  const handleContactChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    updateHall({ hall_contact: digits });
  };

  const handleLicenseChange = (raw) => {
    const digits = raw.replace(/\D/g, "");
    const afterPrefix = digits.startsWith("091") ? digits.slice(3) : digits;
    const limited = afterPrefix.slice(0, 8);
    const formatted = limited.length ? `091-${limited}` : "091-";
    updateHall({ license: formatted });
  };

  const addRoom = () => setRooms((prev) => [...prev, createRoom()]);
  const removeRoom = (idx) => setRooms((prev) => prev.filter((_, i) => i !== idx));
  const updateRoom = (idx, patch) =>
    setRooms((prev) => prev.map((room, i) => (i === idx ? { ...room, ...patch } : room)));

  const applySeatBrush = (roomIndex, rowIndex, seatIndex) => {
    const key = seatKey(rowIndex, seatIndex);
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
    if (step === 0) {
      if (!hall.hall_name.trim()) return "Hall name is required.";
      if (!hall.hall_contact.trim()) return "Contact is required.";
      if (!/^[0-9]{10}$/.test(hall.hall_contact.trim()))
        return "Contact must be exactly 10 digits.";
      if (!hall.license.trim()) return "License is required.";
      if (!/^091-[0-9]{8}$/.test(hall.license.trim()))
        return "License must start with 091- followed by 8 digits.";
    }
    if (step === 1) {
      if (!hall.hall_location.trim()) return "Location is required.";
    }
    if (step === 2) {
      if (!rooms.length) return "Add at least one room.";
      const invalid = rooms.some(
        (r) =>
          !r.roomName.trim() ||
          !Number.isInteger(Number(r.rows)) ||
          Number(r.rows) <= 0 ||
          !Number.isInteger(Number(r.seatsPerRow)) ||
          Number(r.seatsPerRow) <= 0,
      );
      if (invalid) return "Fix room details.";
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    const token =
      sessionStorage.getItem("sessionToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");
    setSubmitting(true);
    try {
      const payload = {
        ...hall,
        hallrooms: rooms,
        totalCapacity,
      };
      const response = await axios.post(`${API_BASE_URL}/hall/apply`, payload, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (response.data.success) {
        toast.success("Application submitted");
        setHall(initialHall);
        setRooms([createRoom()]);
        setStep(0);
      } else {
        toast.error(response.data.message || "Failed to submit");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to submit application",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#e50914" },
          secondary: { main: "#9ca3af" },
          background: { default: "#080808", paper: "#0f0f0f" },
        },
        components: {
          MuiCard: { styleOverrides: { root: { borderColor: "rgba(255,255,255,0.08)" } } },
          MuiOutlinedInput: {
            styleOverrides: {
              root: { backgroundColor: "rgba(255,255,255,0.05)" },
              input: { color: "#fff" },
            },
          },
          MuiFormLabel: { styleOverrides: { root: { color: "#cbd5e1" } } },
          MuiStepLabel: {
            styleOverrides: {
              label: { color: "#94a3b8" },
              labelContainer: { color: "#94a3b8" },
            },
          },
          MuiStepIcon: {
            styleOverrides: {
              root: {
                color: "rgba(255,255,255,0.25)",
                "&.Mui-active": { color: "#e50914" },
                "&.Mui-completed": { color: "#e50914" },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { color: "#e5e7eb" },
            },
          },
        },
      }),
    [],
  );

  if (loading)
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LinearProgress color="secondary" />
      </ThemeProvider>
    );

  if (!isAuthenticated)
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Card sx={{ maxWidth: 640, mx: "auto", mt: 6, bgcolor: "rgba(15,15,15,0.9)", color: "#fff" }}>
          <CardContent>
            <Stack spacing={1} direction="row" alignItems="center">
              <AlertCircle size={20} />
              <Typography variant="h6">Please login to apply as hall staff.</Typography>
            </Stack>
          </CardContent>
        </Card>
      </ThemeProvider>
    );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Hall Name"
                value={hall.hall_name}
                onChange={(e) => updateHall({ hall_name: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.07)" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Contact (10 digits)"
                value={hall.hall_contact}
                onChange={(e) => handleContactChange(e.target.value)}
                inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.07)" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="License (091-XXXXXXXX)"
                value={hall.license || "091-"}
                onChange={(e) => handleLicenseChange(e.target.value)}
                inputProps={{
                  maxLength: 12, // 4 chars for 091- + 8 digits
                  inputMode: "numeric",
                  pattern: "091-[0-9]*",
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.07)" } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<Upload size={16} />}
                fullWidth
              >
                Upload Poster
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    updateHall({ hallPoster: e.target.files?.[0] || null })
                  }
                />
              </Button>
              {hall.hallPoster && (
                <Typography variant="caption" color="#cbd5e1">
                  {hall.hallPoster.name || hall.hallPoster}
                </Typography>
              )}
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Stack spacing={2}>
            <TextField
              label="Location"
              value={hall.hall_location}
              onChange={(e) => updateHall({ hall_location: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.07)" } }}
            />
            <Box height={360} borderRadius={2} overflow="hidden" border="1px solid rgba(255,255,255,0.1)">
              <LocationPickerMap
                locationValue={hall.hall_location}
                onLocationSelect={(val) => updateHall({ hall_location: val })}
              />
            </Box>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2}>
            {rooms.map((room, idx) => (
              <Card key={idx} variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Room Name"
                        value={room.roomName}
                        onChange={(e) => updateRoom(idx, { roomName: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.07)" } }}
                      />
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <TextField
                        label="Rows"
                        type="number"
                        value={room.rows}
                        onChange={(e) => updateRoom(idx, { rows: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "rgba(255,255,255,0.07)" } }}
                      />
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <TextField
                        label="Seats per row"
                        type="number"
                        value={room.seatsPerRow}
                        onChange={(e) => updateRoom(idx, { seatsPerRow: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="error"
                    disabled={rooms.length === 1}
                    onClick={() => removeRoom(idx)}
                  >
                    Remove room
                  </Button>
                </CardActions>
              </Card>
            ))}
            <Button variant="outlined" onClick={addRoom}>
              Add another room
            </Button>
          </Stack>
        );
      case 3:
        return (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Regular"
                color={seatBrush === "regular" ? "success" : "default"}
                onClick={() => setSeatBrush("regular")}
              />
              <Chip
                label="Premium"
                color={seatBrush === "premium" ? "warning" : "default"}
                onClick={() => setSeatBrush("premium")}
              />
              <Chip
                label="Blocked"
                color={seatBrush === "blocked" ? "secondary" : "default"}
                onClick={() => setSeatBrush("blocked")}
              />
            </Stack>
            <Stack spacing={2}>
              {rooms.map((room, roomIndex) => {
                const rows = Number(room.rows);
                const seats = Number(room.seatsPerRow);
                return (
                  <Card key={roomIndex} variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    <CardHeader
                      title={room.roomName || `Room ${roomIndex + 1}`}
                      subheader={`${rows * seats - room.emptySeats.length}/${rows * seats} available`}
                    />
                    <CardContent>
                      <Stack spacing={1}>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                          <Stack key={rowIndex} direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" sx={{ width: 16 }}>
                              {String.fromCharCode(65 + rowIndex)}
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                              {Array.from({ length: seats }).map((__, seatIndex) => {
                                const key = seatKey(rowIndex, seatIndex);
                                const isEmpty = room.emptySeats.includes(key);
                                const seatType =
                                  room.seatTypes?.[key] === "premium" ? "premium" : "regular";
                                return (
                                  <IconButton
                                    key={key}
                                    size="small"
                                    onClick={() => applySeatBrush(roomIndex, rowIndex, seatIndex)}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      color: isEmpty
                                        ? "rgba(148,163,184,0.5)"
                                        : seatType === "premium"
                                          ? "#f59e0b"
                                          : "#ec4899",
                                    }}
                                  >
                                    <Armchair size={16} />
                                  </IconButton>
                                );
                              })}
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ maxWidth: 1100, mx: "auto", my: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle2 size={24} color="#22c55e" />
            <Typography variant="h5" fontWeight={800} color="#fff">
              Apply as Hall Staff
            </Typography>
          </Stack>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Card
            sx={{
              bgcolor: "rgba(12,12,12,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            }}
          >
            <CardContent>
              <Stack spacing={3}>{renderStep()}</Stack>
            </CardContent>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
            <CardActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
              <Button onClick={handleBack} disabled={step === 0}>
                Back
              </Button>
              <Stack direction="row" spacing={1}>
                {step < steps.length - 1 && (
                  <Button variant="contained" color="primary" onClick={handleNext}>
                    Next
                  </Button>
                )}
                {step === steps.length - 1 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </Stack>
            </CardActions>
          </Card>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default HallStaffApply;
