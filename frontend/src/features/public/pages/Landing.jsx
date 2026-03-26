import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowRight, ChevronDown } from "lucide-react";
import axios from "axios";
import Hero from "../../../shared/components/Hero.jsx";
import { API_BASE_URL, API_SERVER_URL } from "../../../shared/config/api";

const PLATFORM_FEATURES = [
  {
    title: "Clear Showtimes",
    detail: "Browse halls, rooms, and times without crowded booking flows or confusing seat states.",
  },
  {
    title: "Reliable Booking",
    detail: "Move from discovery to checkout quickly with organized movie pages and cleaner scheduling.",
  },
  {
    title: "Trusted Halls",
    detail: "Find verified venues, review locations, and compare sessions before you commit.",
  },
];

const FAQS = [
  {
    q: "Can I cancel or reschedule tickets?",
    a: "Yes, cancellation windows differ by hall and showtime. Check the policy on the booking page before you confirm.",
  },
  {
    q: "How do promo codes work?",
    a: "Enter your promo code at checkout. The discount is validated instantly and reflected before submitting payment.",
  },
  {
    q: "Is there a mobile ticket wallet?",
    a: "Every confirmed booking stores a QR code, seat map, and theater directions inside the mobile app and your confirmation email.",
  },
  {
    q: "What does 'Watch Later' mean?",
    a: "Save a movie to your watchlist and we will text you when new showtimes, trailers, or promos drop.",
  },
];

const APP_BADGES = [
  { label: "App Store", detail: "Download for iPhone & iPad" },
  { label: "Google Play", detail: "Download for Android" },
];

const sectionSurface = {
  borderRadius: 0,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(24,24,27,0.95) 0%, rgba(10,10,10,0.98) 100%)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
};

const cardSurface = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 0,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(28,28,30,0.98) 0%, rgba(16,16,18,0.98) 100%)",
  color: "#fff",
  boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
  transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
  "&:hover": {
    transform: "translateY(-6px)",
    borderColor: "rgba(229,9,20,0.45)",
    boxShadow: "0 24px 70px rgba(229,9,20,0.16)",
  },
};

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop";

const getMoviePosterUrl = (poster) => {
  if (!poster) return FALLBACK_POSTER;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const normalizeTags = (genre) => {
  if (Array.isArray(genre)) return genre.slice(0, 2);
  if (typeof genre === "string") {
    return genre
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 2);
  }
  return ["Movie"];
};

const normalizeDuration = (duration) => {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
};

const normalizeReleaseDate = (releaseDate) => {
  if (!releaseDate) return null;
  const parsed = new Date(releaseDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatReleaseLabel = (releaseDate) => {
  const parsed = normalizeReleaseDate(releaseDate);
  if (!parsed) return "Release date to be announced";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SectionHeading = ({ eyebrow, title, description, actionLabel }) => (
  <Stack
    direction={{ xs: "column", md: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", md: "flex-end" }}
    spacing={2}
    sx={{ mb: 4 }}
  >
    <Box>
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{
            letterSpacing: "0.36em",
            color: "rgba(255,255,255,0.62)",
            display: "block",
            mb: 0.5,
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
        {title}
      </Typography>
      {description ? (
        <Typography sx={{ mt: 1, maxWidth: 680, color: "rgba(255,255,255,0.68)" }}>
          {description}
        </Typography>
      ) : null}
    </Box>
    {actionLabel ? (
      <Button
        component={RouterLink}
        to="/movies"
        endIcon={<ArrowRight size={16} />}
        sx={{
          color: "#fff",
          borderRadius: 0,
          px: 2.5,
          py: 1.1,
          border: "1px solid rgba(229,9,20,0.5)",
          backgroundColor: "rgba(229,9,20,0.14)",
          textTransform: "none",
          fontWeight: 700,
          "&:hover": {
            borderColor: "#e50914",
            backgroundColor: "rgba(229,9,20,0.22)",
          },
        }}
      >
        {actionLabel}
      </Button>
    ) : null}
  </Stack>
);

function MovieCard({ id, image, title, genre, runtime }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      sx={{
        ...cardSurface,
        maxWidth: 345,
        minHeight: 350,
        position: "relative",
        overflow: "hidden",
        transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label={`${title} movie card`}
    >
      <CardMedia
        component="img"
        alt={`${title} poster`}
        image={image}
        sx={{
          height: "100%",
          minHeight: 350,
          objectFit: "cover",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.86) 58%, rgba(0,0,0,0.94) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          p: 1,
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? "visible" : "hidden",
          transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
          pointerEvents: isHovered ? "auto" : "none",
        }}
      >
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", pb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              mb: 1.25,
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {genre}
          </Typography>

          <Typography gutterBottom variant="h5" component="div" sx={{ color: "#fff", fontWeight: 800 }}>
            {title}
          </Typography>

          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            {runtime ? `${genre}${genre ? " | " : ""}${runtime}` : genre}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            justifyContent: "space-around",
            px: 2,
            pb: 2,
            pt: 0.5,
          }}
        >
          <Button
            component={RouterLink}
            to={id ? `/movies/${id}` : "/movies"}
            size="small"
            variant="contained"
            sx={{
              borderRadius: 0,
              backgroundColor: "#e50914",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { backgroundColor: "#c80811" },
            }}
          >
            Buy Tickets
          </Button>
          <Button
            component={RouterLink}
            to={id ? `/movies/${id}` : "/movies"}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 0,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.72)",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            Watch Trailer
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
}

const EmptyStateCard = ({ message }) => (
  <Paper sx={{ ...cardSurface, p: 3, minHeight: 220, justifyContent: "center" }}>
    <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
      {message}
    </Typography>
  </Paper>
);

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const [movies, setMovies] = useState([]);
  const [hallCount, setHallCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [moviesResponse, hallsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/movie/get`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/hall/get-active`, { withCredentials: true }),
        ]);

        if (moviesResponse.data?.success && Array.isArray(moviesResponse.data.data)) {
          const mappedMovies = moviesResponse.data.data.map((movie) => ({
            id: movie.id,
            title: movie.movie_title || movie.title || "Untitled",
            genre: normalizeTags(movie.genre).join(" | "),
            runtime: normalizeDuration(movie.duration),
            image: getMoviePosterUrl(movie.moviePoster),
            summary: movie.description || movie.summary || "Details coming soon.",
            releaseDate: movie.releaseDate || null,
          }));
          setMovies(mappedMovies);
        } else {
          setMovies([]);
        }

        if (hallsResponse.data?.success && Array.isArray(hallsResponse.data.data)) {
          setHallCount(hallsResponse.data.data.length);
        } else {
          setHallCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch landing page data", error);
        setMovies([]);
        setHallCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const today = useMemo(() => new Date(), []);

  const nowShowingMovies = useMemo(
    () =>
      movies
        .filter((movie) => {
          const releaseDate = normalizeReleaseDate(movie.releaseDate);
          return !releaseDate || releaseDate <= today;
        })
        .slice(0, 6),
    [movies, today],
  );

  const featuredMovies = useMemo(() => movies.slice(0, 6), [movies]);

  const comingSoonMovies = useMemo(
    () =>
      movies
        .filter((movie) => {
          const releaseDate = normalizeReleaseDate(movie.releaseDate);
          return releaseDate && releaseDate > today;
        })
        .sort((a, b) => normalizeReleaseDate(a.releaseDate) - normalizeReleaseDate(b.releaseDate))
        .slice(0, 3),
    [movies, today],
  );

  const heroStats = useMemo(
    () => [
      { label: "Movies Available", value: String(movies.length) },
      { label: "Active Locations", value: String(hallCount) },
      { label: "Coming Soon", value: String(comingSoonMovies.length) },
    ],
    [comingSoonMovies.length, hallCount, movies.length],
  );

  return (
    <Box sx={{ backgroundColor: "#050505", color: "#fff" }}>
      <Hero />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {heroStats.map((stat) => (
            <Paper key={stat.label} sx={{ ...sectionSurface, p: 3.5 }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: "#fff" }}>
                {stat.value}
              </Typography>
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.34em" }}
              >
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Paper sx={{ ...sectionSurface, p: { xs: 3, md: 4 } }}>
          <SectionHeading
            eyebrow="Now Showing"
            title="What audiences are booking today"
            description="A live look at currently available movies from your catalog."
            actionLabel="Browse movies"
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {loading ? (
              <EmptyStateCard message="Loading live movies..." />
            ) : nowShowingMovies.length > 0 ? (
              nowShowingMovies.map((movie) => <MovieCard key={movie.id || movie.title} {...movie} />)
            ) : (
              <EmptyStateCard message="No currently released movies are available yet." />
            )}
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Paper sx={{ ...sectionSurface, p: { xs: 3, md: 4 } }}>
          <SectionHeading
            eyebrow="Featured"
            title="More movies from the current lineup"
            description="A broader look at titles available across your current catalog."
            actionLabel="See showtimes"
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {loading ? (
              <EmptyStateCard message="Loading featured titles..." />
            ) : featuredMovies.length > 0 ? (
              featuredMovies.map((movie) => <MovieCard key={movie.id || movie.title} {...movie} />)
            ) : (
              <EmptyStateCard message="No featured movies are available right now." />
            )}
          </Box>
        </Paper>
      </Container>

     

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Paper
          sx={{
            ...sectionSurface,
            p: { xs: 3, md: 4 },
            background:
              "linear-gradient(135deg, rgba(31,31,34,0.98) 0%, rgba(10,10,10,0.98) 65%, rgba(78,13,17,0.92) 100%)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
              gap: 4,
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "rgba(255,255,255,0.58)", letterSpacing: "0.34em" }}
              >
                Why CinemaHub
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, fontWeight: 900, lineHeight: 1.15 }}>
                A more professional way to discover cinemas, movies, and showtimes
              </Typography>
              <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.72)", lineHeight: 1.9, maxWidth: 620 }}>
                Built for moviegoers who want less clutter and more confidence. CinemaHub helps you compare halls,
                find the right session faster, and book with a cleaner flow from landing page to ticket confirmation.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                <Button
                  component={RouterLink}
                  to="/movies"
                  variant="contained"
                  endIcon={<ArrowRight size={16} />}
                  sx={{
                    borderRadius: 0,
                    px: 3,
                    py: 1.4,
                    backgroundColor: "#e50914",
                    textTransform: "none",
                    fontWeight: 800,
                    "&:hover": { backgroundColor: "#c80811" },
                  }}
                >
                  Explore Movies
                </Button>
                <Button
                  component={RouterLink}
                  to="/locations"
                  variant="outlined"
                  sx={{
                    borderRadius: 0,
                    px: 3,
                    py: 1.4,
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.22)",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  View Locations
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
              }}
            >
              {PLATFORM_FEATURES.map((item, index) => (
                <Paper
                  key={item.title}
                  sx={{
                    p: 2.5,
                    borderRadius: 0,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: index === 0 ? "rgba(229,9,20,0.12)" : "rgba(255,255,255,0.04)",
                    color: "#fff",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.8 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
                    {item.detail}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Paper sx={{ ...sectionSurface, p: { xs: 3, md: 4 } }}>
          <SectionHeading eyebrow="Frequently Asked Questions" title="Answers in seconds" />
          <Stack spacing={2}>
            {FAQS.map((item, index) => (
              <Accordion
                key={item.q}
                expanded={openFaq === index}
                onChange={(_, expanded) => setOpenFaq(expanded ? index : -1)}
                disableGutters
                sx={{
                  borderRadius: "0 !important",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    "linear-gradient(180deg, rgba(28,28,30,0.98) 0%, rgba(15,15,16,0.98) 100%)",
                  color: "#fff",
                  overflow: "hidden",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown size={18} color="#ffffff" />}
                  sx={{
                    px: 3,
                    py: 1,
                    "& .MuiAccordionSummary-content": { my: 1.2 },
                  }}
                >
                  <Typography sx={{ fontWeight: 700, letterSpacing: "0.04em" }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pt: 0, pb: 3 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.8 }}>
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Paper>
      </Container>

      <Container maxWidth="md" sx={{ pb: { xs: 7, md: 10 } }}>
     
      </Container>
    </Box>
  );
}
