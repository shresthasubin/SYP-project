import React, { useEffect, useMemo, useState } from "react";
import { Armchair, CheckCircle2, Clock4, XCircle, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import apiClient, { API_SERVER_URL } from "../../../shared/config/api";

const FormApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get("/hall/applications");
      setApplications(response || []);
    } catch (err) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (id) => {
    setSubmittingId(id);
    try {
      await apiClient.put(`/hall/applications/${id}/approve`, {});
      toast.success("Application approved");
      fetchApplications();
    } catch (error) {
      const detailMessage = error.response?.data?.details?.[0]?.message;
      toast.error(
        detailMessage ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to approve application",
      );
    }
    setSubmittingId(null);
  };

  const handleRejectApplication = async (id) => {
    const reviewNote = window.prompt("Optional rejection note:", "") || "";
    setSubmittingId(id);
    try {
      await apiClient.put(`/hall/applications/${id}/reject`, { reviewNote });
      toast.success("Application rejected");
      fetchApplications();
    } catch (error) {
      const detailMessage = error.response?.data?.details?.[0]?.message;
      toast.error(
        detailMessage ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to reject application",
      );
    }
    setSubmittingId(null);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#e50914" },
          secondary: { main: "#9ca3af" },
          background: { default: "#0a0a0d", paper: "#111116" },
        },
        components: {
          MuiCard: { styleOverrides: { root: { borderColor: "rgba(255,255,255,0.08)" } } },
          MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: "rgba(255,255,255,0.04)" } } },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 600, textTransform: "capitalize" },
            },
          },
        },
      }),
    [],
  );

  const statusChip = (status = "pending") => {
    const map = {
      approved: { color: "success", icon: <CheckCircle2 size={16} /> },
      rejected: { color: "error", icon: <XCircle size={16} /> },
      pending: { color: "warning", icon: <Clock4 size={16} /> },
    };
    const { color, icon } = map[status] || map.pending;
    return (
      <Chip
        size="small"
        color={color}
        variant="outlined"
        icon={icon}
        label={status.replace("_", " ")}
        sx={{ borderRadius: 1.5, borderColor: "rgba(255,255,255,0.16)" }}
      />
    );
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const ExpandIconButton = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme: t, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: t.transitions.create("transform", {
      duration: t.transitions.duration.shortest,
    }),
  }));

  const renderSeatGrid = (room, roomIndex, appId) => {
    const rows = Number(room.rows ?? room.totalRows ?? 0);
    const seats = Number(room.seatsPerRow ?? room.totalColumns ?? 0);
    const emptySeats = Array.isArray(room.emptySeats) ? room.emptySeats : [];
    const emptySet = new Set(emptySeats);
    const capacity = rows * seats;
    const available = capacity - emptySeats.length;

    if (!rows || !seats) {
      return (
        <Typography variant="body2" color="text.secondary">
          No seat layout provided.
        </Typography>
      );
    }

    return (
      <Box key={`${appId}-${roomIndex}`} sx={{ p: 2, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography fontWeight={700}>{room.roomName || `Room ${roomIndex + 1}`}</Typography>
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`${available}/${capacity} available`}
            sx={{ borderColor: "rgba(255,255,255,0.18)" }}
          />
        </Stack>
        <Box sx={{ overflowX: "auto" }}>
          <Stack spacing={1.2}>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <Stack key={rowIndex} direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption" width={16} color="text.secondary">
                  {String.fromCharCode(65 + rowIndex)}
                </Typography>
                <Stack direction="row" spacing={0.6}>
                  {Array.from({ length: seats }).map((__, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    const isEmpty = emptySet.has(key);
                    return (
                      <Tooltip key={key} title={isEmpty ? "Blocked" : "Seat available"}>
                        <span>
                          <Armchair
                            size={16}
                            color={isEmpty ? "#4b5563" : "#e50914"}
                            style={{ opacity: isEmpty ? 0.35 : 1 }}
                          />
                        </span>
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  };

  const renderApplicationCard = (app) => {
    const isExpanded = expandedAppId === app.id;
    return (
      <Card
        key={app.id}
        variant="outlined"
        sx={{
          bgcolor: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.08)",
          "&:hover": { borderColor: "rgba(229,9,20,0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" },
        }}
      >
        <CardHeader
          avatar={
            <Badge
              overlap="circular"
              variant="dot"
              color={app.status === "approved" ? "success" : app.status === "rejected" ? "error" : "warning"}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "rgba(229,9,20,0.12)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Armchair size={20} color="#e50914" />
              </Box>
            </Badge>
          }
          title={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">{app.hall_name || "Untitled Hall"}</Typography>
              {statusChip(app.status)}
            </Stack>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {app.hall_location || "Location not provided"} • Submitted{" "}
              {app.createdAt ? new Date(app.createdAt).toLocaleString() : "—"}
            </Typography>
          }
        />

        <CardContent>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={8}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Chip
                  label={`Contact: ${app.hall_contact || "—"}`}
                  variant="outlined"
                  color="secondary"
                  icon={<CheckCircle2 size={16} />}
                  sx={{ borderColor: "rgba(255,255,255,0.12)" }}
                />
                <Chip
                  label={`License: ${app.license || "—"}`}
                  variant="outlined"
                  color="secondary"
                  icon={<CheckCircle2 size={16} />}
                  sx={{ borderColor: "rgba(255,255,255,0.12)" }}
                />
                <Chip
                  label={`Capacity: ${app.totalCapacity ?? 0}`}
                  variant="outlined"
                  color="secondary"
                  icon={<Armchair size={14} />}
                  sx={{ borderColor: "rgba(255,255,255,0.12)" }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} textAlign={{ xs: "left", md: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Applicant ID: {app.applicant_id || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review note: {app.review_note || "—"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleApproveApplication(app.id)}
            disabled={submittingId === app.id}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleRejectApplication(app.id)}
            disabled={submittingId === app.id}
            sx={{ ml: 1 }}
          >
            Reject
          </Button>
          <ExpandIconButton
            expand={isExpanded}
            onClick={() => setExpandedAppId((prev) => (prev === app.id ? null : app.id))}
            aria-expanded={isExpanded}
            aria-label="show more"
          >
            <ChevronDown size={18} />
          </ExpandIconButton>
        </CardActions>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
          <CardContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {app.hallPoster && (
                <Grid item xs={12} md={4}>
                  <Box
                    component="img"
                    alt={app.hall_name}
                    src={`${API_SERVER_URL}/uploads/${app.hallPoster}`}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={app.hallPoster ? 8 : 12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Hall Rooms & Seat Layout
                </Typography>
                {!Array.isArray(app.hallrooms) || app.hallrooms.length === 0 ? (
                  <Alert severity="info" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
                    No room configuration submitted.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {app.hallrooms.map((room, index) => renderSeatGrid(room, index, app.id))}
                  </Stack>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  const renderSkeleton = () => (
    <Stack spacing={2}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} variant="outlined" sx={{ bgcolor: "rgba(255,255,255,0.03)" }}>
          <CardHeader
            avatar={<Skeleton variant="circular" width={44} height={44} />}
            title={<Skeleton width="60%" />}
            subheader={<Skeleton width="40%" />}
          />
          <CardContent>
            <Skeleton variant="rounded" height={36} width="90%" sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={120} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Hall Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review, approve, or reject hall registration submissions.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" useFlexGap>
            {[
              {
                key: "total",
                label: "Total",
                value: stats.total,
                icon: <Armchair size={18} color="#e50914" />,
                borderColor: "rgba(255,255,255,0.08)",
              },
              {
                key: "pending",
                label: "Pending",
                value: stats.pending,
                icon: <Clock4 size={18} color="#eab308" />,
                borderColor: "rgba(229,9,20,0.35)",
              },
              {
                key: "approved",
                label: "Approved",
                value: stats.approved,
                icon: <CheckCircle2 size={18} color="#22c55e" />,
                borderColor: "rgba(255,255,255,0.08)",
              },
              {
                key: "rejected",
                label: "Rejected",
                value: stats.rejected,
                icon: <XCircle size={18} color="#ef4444" />,
                borderColor: "rgba(255,255,255,0.08)",
              },
            ].map((card) => (
              <Card
                key={card.key}
                variant="outlined"
                sx={{
                  flex: "1 1 200px",
                  minWidth: 0,
                  borderColor: card.borderColor,
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      bgcolor: "rgba(255,255,255,0.04)",
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {card.icon}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Pending Hall Registrations
            </Typography>
            {loading ? (
              renderSkeleton()
            ) : applications.length === 0 ? (
              <Alert severity="info" variant="outlined" sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
                No pending applications.
              </Alert>
            ) : (
              <Stack spacing={2}>{applications.map((app) => renderApplicationCard(app))}</Stack>
            )}
          </Box>
        </Stack>
        {submittingId && <LinearProgress color="primary" sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} />}
      </Box>
    </ThemeProvider>
  );
};

export default FormApplications;
