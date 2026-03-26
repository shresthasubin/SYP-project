import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquare,
  Play,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

const BRAND = {
  page: "#050505",
  shell: "#0b0b0b",
  shellSoft: "#111111",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.66)",
  subtle: "rgba(255,255,255,0.42)",
  accent: "#e50914",
  accentHover: "#b20710",
};

const formatStatValue = (movie, formatDuration) => [
   { badge: "3D", value: formatDuration(movie.duration), bg: alpha(BRAND.accent, 0.14), color: "#ffffff" },
];

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
}) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const castNames = Array.isArray(movie.casts)
    ? movie.casts
    : typeof movie.casts === "string"
      ? movie.casts.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  const castImages = Array.isArray(movie.castImages) ? movie.castImages : [];
  const trailerUrl = getTrailerUrl(movie.movieTrailer);
  const firstShowtimeId = groupedByHallroom?.[0]?.times?.[0]?.id;
  const selectedDateKey = activeDate || uniqueDates[0] || "";
  const selectedDateIndex = Math.max(0, uniqueDates.findIndex((dateKey) => dateKey === selectedDateKey));
  const stats = useMemo(() => formatStatValue(movie, formatDuration), [movie, formatDuration]);

  const genres = useMemo(() => {
    if (Array.isArray(movie.genre)) return movie.genre;
    if (typeof movie.genre === "string") {
      return movie.genre.split("|").map((item) => item.trim()).filter(Boolean);
    }
    return genreLabel ? [genreLabel] : [];
  }, [movie.genre, genreLabel]);

  const featuredCast = useMemo(
    () =>
      castNames.slice(0, 7).map((name, index) => ({
        name,
        image: getCastImageUrl(castImages[index]),
      })),
    [castImages, castNames, getCastImageUrl],
  );

  const details = [
    { title: "Director", value: movie.director || "Not available" },
    { title: "Writers", value: movie.writer || "Not available" },
    { title: "Stars", value: castNames.length ? castNames.slice(0, 3).join(" • ") : "Not available" },
  ];

  const openTrailer = () => {
    if (!trailerUrl) {
      toast.error("Trailer is not available");
      return;
    }
    setIsTrailerOpen(true);
  };

  const openFirstShowtime = () => {
    if (!firstShowtimeId) {
      toast.error("No showtimes available right now");
      return;
    }
    onOpenBooking(firstShowtimeId);
  };

  return (
    <>
      <Box sx={{ bgcolor: BRAND.page, pt: { xs: 0.25, md: 0.75 }, pb: { xs: 4, md: 2 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 } }}>
          <Paper
            sx={{
              overflow: "hidden",
              borderRadius: { xs: 0, sm: 2 },
              bgcolor: BRAND.shell,
              border: `1px solid ${alpha("#fff", 0.04)}`,
              boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
            }}
          >
            <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 1.75, sm: 2, md: 2.5 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 2.25, md: 4 }}
                alignItems={{ xs: "stretch", md: "flex-start" }}
              >
                <Box sx={{ width: { xs: 148, sm: 190, md: 240 }, mx: { xs: "auto", md: 0 }, flexShrink: 0 }}>
                  <Box
                    component="img"
                    src={getPosterUrl(movie.moviePoster)}
                    alt={movie.movie_title}
                    sx={{
                      width: "100%",
                      aspectRatio: "0.7",
                      objectFit: "cover",
                      borderRadius: 1.5,
                      border: `1px solid ${alpha("#fff", 0.05)}`,
                      display: "block",
                    }}
                  />
                </Box>

                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={{ xs: 2.25, lg: 4 }}
                  alignItems="flex-start"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: BRAND.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: { xs: "center", md: "left" } }}>
                      English
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.75,
                        color: BRAND.text,
                        fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem", lg: "3.35rem" },
                        fontWeight: 800,
                        lineHeight: { xs: 1.08, md: 1.04 },
                        letterSpacing: "-0.04em",
                        maxWidth: 640,
                        textAlign: { xs: "center", md: "left" },
                      }}
                    >
                      {movie.movie_title}
                    </Typography>

                    <Typography sx={{ mt: 1.5, color: BRAND.muted, fontSize: { xs: 13, sm: 14 }, lineHeight: { xs: 1.7, sm: 1.9 }, maxWidth: 700, textAlign: { xs: "center", md: "left" } }}>
                      {movie.description || "No description available for this movie."}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
                      {genres.slice(0, 5).map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          size="small"
                          sx={{
                            height: 26,
                            borderRadius: 1,
                            bgcolor: alpha("#fff", 0.04),
                            color: BRAND.muted,
                            border: `1px solid ${BRAND.border}`,
                          }}
                        />
                      ))}
                    </Stack>

                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
                      {stats.map((item) => (
                        <Stack key={item.badge} direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 22,
                              borderRadius: 0.75,
                              bgcolor: item.bg,
                              color: item.color,
                              fontWeight: 800,
                            }}
                          />
                          <Typography sx={{ color: BRAND.muted, fontSize: 12.5 }}>{item.value}</Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 2.5, width: "100%" }}>
                      <Button
                        variant="contained"
                        onClick={openTrailer}
                        sx={{
                          borderRadius: 1.5,
                          width: { xs: "100%", sm: "auto" },
                          px: 2.25,
                          py: 1.1,
                          bgcolor: alpha("#fff", 0.08),
                          color: "#fff",
                          fontWeight: 700,
                          textTransform: "none",
                          boxShadow: "none",
                          "&:hover": { bgcolor: alpha("#fff", 0.14), boxShadow: "none" },
                        }}
                      >
                        Watch Trailer
                      </Button>
                      <IconButton
                        onClick={openTrailer}
                        sx={{
                          alignSelf: { xs: "center", sm: "stretch" },
                          width: 42,
                          height: 42,
                          borderRadius: 99,
                          bgcolor: BRAND.accent,
                          color: "#fff",
                          "&:hover": { bgcolor: BRAND.accentHover },
                        }}
                      >
                        <Play size={15} fill="currentColor" />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box sx={{ width: { xs: "100%", lg: 260 }, flexShrink: 0 }}>
                    {details.map((item, index) => (
                      <Box
                        key={item.title}
                        sx={{
                          py: 1.5,
                          borderBottom: index === details.length - 1 ? "none" : `1px solid ${BRAND.border}`,
                        }}
                      >
                        <Typography sx={{ color: BRAND.text, fontWeight: 600 }}>{item.title}</Typography>
                        <Typography sx={{ mt: 0.75, color: BRAND.muted, fontSize: 13, lineHeight: 1.7 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </Stack>

              {featuredCast.length > 0 ? (
                <Box sx={{ mt: 3.5 }}>
                  <Typography sx={{ mb: 1.5, color: BRAND.muted, fontSize: 11.5 }}>Your Favorite Cast</Typography>
                  <Stack direction="row" spacing={{ xs: 1.5, sm: 2.5 }} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: "center", md: "flex-start" } }}>
                    {featuredCast.map((member) => (
                      <Stack key={member.name} alignItems="center" spacing={0.8} sx={{ width: { xs: 64, sm: 72 } }}>
                        <Avatar src={member.image} alt={member.name} sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 }, border: `1px solid ${BRAND.border}` }} />
                        <Typography sx={{ color: BRAND.muted, fontSize: 10.5, textAlign: "center", lineHeight: 1.35 }}>
                          {member.name}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ) : null}
            </Box>

            <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 2, md: 2.5 } }}>
              <Paper
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 1.5,
                  bgcolor: alpha(BRAND.accent, 0.08),
                  border: `1px solid ${alpha(BRAND.accent, 0.08)}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={{ xs: 2, lg: 3 }}
                  alignItems={{ xs: "stretch", lg: "flex-start" }}
                  justifyContent="space-between"
                >
                  <Stack spacing={1.2} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography sx={{ color: BRAND.text, fontSize: 13, whiteSpace: "nowrap" }}>Choose Date</Typography>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        justifyContent="flex-end"
                        sx={{ minWidth: 72, flexShrink: 0 }}
                      >
                        <IconButton
                          onClick={() => {
                            if (selectedDateIndex > 0) onDateChange(uniqueDates[selectedDateIndex - 1]);
                          }}
                          disabled={selectedDateIndex <= 0}
                          sx={{
                            color: BRAND.accent,
                            borderRadius: 1,
                            width: 32,
                            height: 32,
                            border: `1px solid ${alpha(BRAND.accent, 0.28)}`,
                            bgcolor: alpha(BRAND.accent, 0.08),
                            "&.Mui-disabled": {
                              color: "rgba(255,255,255,0.22)",
                              borderColor: "rgba(255,255,255,0.08)",
                              bgcolor: "rgba(255,255,255,0.03)",
                            },
                          }}
                        >
                          <ChevronLeft size={16} />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            if (selectedDateIndex < uniqueDates.length - 1) onDateChange(uniqueDates[selectedDateIndex + 1]);
                          }}
                          disabled={selectedDateIndex >= uniqueDates.length - 1}
                          sx={{
                            color: BRAND.accent,
                            borderRadius: 1,
                            width: 32,
                            height: 32,
                            border: `1px solid ${alpha(BRAND.accent, 0.28)}`,
                            bgcolor: alpha(BRAND.accent, 0.08),
                            "&.Mui-disabled": {
                              color: "rgba(255,255,255,0.22)",
                              borderColor: "rgba(255,255,255,0.08)",
                              bgcolor: "rgba(255,255,255,0.03)",
                            },
                          }}
                        >
                          <ChevronRight size={16} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      useFlexGap
                      sx={{
                        flexWrap: { xs: "nowrap", sm: "wrap" },
                        overflowX: { xs: "auto", sm: "visible" },
                        pb: { xs: 0.5, sm: 0 },
                      }}
                    >
                      {uniqueDates.slice(0, 6).map((dateKey) => {
                        const date = new Date(dateKey);
                        const active = dateKey === selectedDateKey;
                        return (
                          <Button
                            key={dateKey}
                            onClick={() => onDateChange(dateKey)}
                            sx={{
                              flexShrink: 0,
                              minWidth: 44,
                              borderRadius: 1,
                              px: 1,
                              py: 0.65,
                              bgcolor: active ? BRAND.accent : alpha("#fff", 0.02),
                              color: active ? "#fff" : BRAND.muted,
                              border: `1px solid ${active ? BRAND.accent : alpha("#fff", 0.05)}`,
                              flexDirection: "column",
                              lineHeight: 1.05,
                              textTransform: "none",
                            }}
                          >
                            <Typography sx={{ fontSize: 9, color: active ? "rgba(255,255,255,0.75)" : BRAND.subtle }}>
                              {date.toLocaleDateString(undefined, { month: "short" })}
                            </Typography>
                            <Typography sx={{ fontSize: 16, fontWeight: 800 }}>
                              {date.toLocaleDateString(undefined, { day: "2-digit" })}
                            </Typography>
                            <Typography sx={{ fontSize: 9 }}>
                              {date.toLocaleDateString(undefined, { weekday: "short" })}
                            </Typography>
                          </Button>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Stack>

                <Box sx={{ mt: 2.25 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography sx={{ color: BRAND.text, fontSize: 16, fontWeight: 700 }}>
                        Available Showtimes
                      </Typography>
                      <Typography sx={{ color: BRAND.muted, fontSize: 12 }}>
                        Pick a hall and tap a time directly. No hidden dropdowns.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={openFirstShowtime}
                      disabled={!firstShowtimeId}
                      sx={{
                        borderRadius: 1,
                        px: 2,
                        py: 0.85,
                        bgcolor: BRAND.accent,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": { bgcolor: BRAND.accentHover, boxShadow: "none" },
                        "&.Mui-disabled": {
                          bgcolor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.38)",
                        },
                      }}
                    >
                      {firstShowtimeId ? "Book earliest show" : "No shows available"}
                    </Button>
                  </Stack>

                  {groupedByHallroom.length === 0 ? (
                    <Paper
                      sx={{
                        borderRadius: 1.5,
                        p: 2,
                        bgcolor: alpha("#fff", 0.03),
                        border: `1px solid ${BRAND.border}`,
                      }}
                    >
                      <Typography sx={{ color: BRAND.text, fontWeight: 700 }}>
                        No shows for this date
                      </Typography>
                      <Typography sx={{ mt: 0.75, color: BRAND.muted, fontSize: 13 }}>
                        Try another date to see available halls and times.
                      </Typography>
                    </Paper>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                        gap: 1.5,
                      }}
                    >
                      {groupedByHallroom.map((group) => (
                        <Paper
                          key={`${group.hallName}-${group.roomName}`}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: alpha("#fff", 0.03),
                            border: `1px solid ${BRAND.border}`,
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: BRAND.text, fontWeight: 700, fontSize: 15 }}>
                                {group.hallName}
                              </Typography>
                              <Typography sx={{ mt: 0.5, color: BRAND.muted, fontSize: 12 }}>
                                {group.roomName}
                              </Typography>
                              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, color: BRAND.subtle }}>
                                <MapPin size={13} />
                                <Typography sx={{ fontSize: 12 }}>{group.hallLocation}</Typography>
                              </Stack>
                            </Box>

                            {group.hallId ? (
                              <Button
                                onClick={() => onOpenChat?.(group)}
                                startIcon={<MessageSquare size={15} />}
                                sx={{
                                  minWidth: 0,
                                  borderRadius: 1,
                                  px: 1.5,
                                  py: 0.7,
                                  bgcolor: alpha("#fff", 0.04),
                                  color: BRAND.text,
                                  textTransform: "none",
                                  fontSize: 12,
                                  whiteSpace: "nowrap",
                                  "&:hover": { bgcolor: alpha("#fff", 0.08) },
                                }}
                              >
                                Message hall
                              </Button>
                            ) : null}
                          </Stack>

                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1.5, color: BRAND.subtle }}>
                            <Clock3 size={13} />
                            <Typography sx={{ fontSize: 12 }}>
                              {group.times.length} show{group.times.length === 1 ? "" : "s"} available
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                            {group.times.map((time) => (
                              <Button
                                key={time.id}
                                onClick={() => onOpenBooking(time.id)}
                                sx={{
                                  borderRadius: 1,
                                  px: 1.5,
                                  py: 0.8,
                                  bgcolor: alpha(BRAND.accent, 0.12),
                                  color: "#fff",
                                  border: `1px solid ${alpha(BRAND.accent, 0.28)}`,
                                  textTransform: "none",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  "&:hover": {
                                    bgcolor: alpha(BRAND.accent, 0.22),
                                  },
                                }}
                              >
                                {time.start}
                              </Button>
                            ))}
                          </Stack>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Paper>

          <Box sx={{ mt: { xs: 3, md: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ color: BRAND.text, fontSize: 14, fontWeight: 700 }}>You May Also Like</Typography>
              <Button component={Link} to="/movies" sx={{ color: BRAND.muted, textTransform: "none", fontSize: 12 }}>
                View all
              </Button>
            </Stack>

            <Stack direction="row" spacing={{ xs: 1.5, sm: 2.5 }} flexWrap="wrap" useFlexGap>
              {groupedByHallroom.slice(0, 4).map((group) => (
                <Paper
                  key={`${group.hallName}-${group.roomName}`}
                  sx={{
                    width: { xs: "100%", sm: "calc(50% - 10px)", lg: "calc(25% - 15px)" },
                    p: { xs: 1.25, sm: 1.75 },
                    borderRadius: 1.5,
                    bgcolor: BRAND.shell,
                    border: `1px solid ${BRAND.border}`,
                  }}
                >
                  <Box
                    component="img"
                    src={getPosterUrl(movie.moviePoster)}
                    alt={movie.movie_title}
                    sx={{
                      width: "100%",
                      aspectRatio: "1.35",
                      objectFit: "cover",
                      borderRadius: 1.25,
                      display: "block",
                    }}
                  />
                  <Typography sx={{ mt: 1.25, color: BRAND.text, fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>
                    {movie.movie_title}
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: BRAND.muted, fontSize: 11 }}>
                    {group.hallName}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25, gap: 1 }}>
                    <Button
                      onClick={() => {
                        const firstId = group.times?.[0]?.id;
                        if (firstId) onOpenBooking(firstId);
                      }}
                      sx={{
                        minWidth: 0,
                        px: 1.2,
                        py: 0.55,
                        whiteSpace: "nowrap",
                        borderRadius: 1,
                        bgcolor: BRAND.accent,
                        color: "#fff",
                        fontSize: 10.5,
                        textTransform: "none",
                        "&:hover": { bgcolor: BRAND.accentHover },
                      }}
                    >
                      Buy ticket
                    </Button>
                    <Typography sx={{ color: BRAND.subtle, fontSize: 10.5 }}>
                      {group.times?.length || 0} shows
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Dialog open={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} fullWidth maxWidth="lg">
        <DialogContent sx={{ p: { xs: 1, sm: 1.5 }, bgcolor: "#090909" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: { xs: 0.5, sm: 1 }, pb: 1 }}>
            <Typography sx={{ color: "#fff", fontWeight: 700 }}>{movie.movie_title} Trailer</Typography>
            <IconButton onClick={() => setIsTrailerOpen(false)} sx={{ color: "#fff" }}>
              <X size={18} />
            </IconButton>
          </Stack>
          <Box
            component="video"
            key={trailerUrl}
            controls
            autoPlay
            src={trailerUrl}
            sx={{ width: "100%", maxHeight: "72vh", borderRadius: 1.5, bgcolor: "#000" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
