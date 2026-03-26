import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, Users, MessageCircle, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_SERVER_URL } from "../config/api";
import { useAuth } from "../hooks/useAuth.js";
import LiveChatModal from "../../features/chat/components/LiveChatModal.jsx";

const FALLBACK_HALL_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop";
const LOCATION_CITY_STORAGE_KEY = "selected_city";
const LOCATION_CITY_EVENT = "city-changed";
const ALL_NEPAL_CITY = "All Nepal";

const getHallPosterUrl = (poster) => {
  if (!poster) return FALLBACK_HALL_IMAGE;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const hallCardSurface = {
  borderRadius: 0,
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(14,14,16,0.98) 100%)",
  color: "#fff",
  boxShadow: "0 16px 48px rgba(0,0,0,0.24)",
  transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: "rgba(229,9,20,0.42)",
    boxShadow: "0 20px 56px rgba(229,9,20,0.12)",
  },
};

const Halls = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chatHall, setChatHall] = useState(null);
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      return localStorage.getItem(LOCATION_CITY_STORAGE_KEY) || ALL_NEPAL_CITY;
    } catch {
      return ALL_NEPAL_CITY;
    }
  });

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/hall/get-active`);
        if (response.data?.success && Array.isArray(response.data.data)) {
          setHalls(response.data.data);
        } else {
          setHalls([]);
        }
      } catch (error) {
        console.error("Failed to fetch halls", error);
        setHalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      try {
        setSelectedCity(localStorage.getItem(LOCATION_CITY_STORAGE_KEY) || ALL_NEPAL_CITY);
      } catch {
        setSelectedCity(ALL_NEPAL_CITY);
      }
    };

    const handleCityChange = (event) => {
      const nextCity = event?.detail?.city;
      if (typeof nextCity === "string" && nextCity.trim()) {
        setSelectedCity(nextCity);
        return;
      }
      syncFromStorage();
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(LOCATION_CITY_EVENT, handleCityChange);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(LOCATION_CITY_EVENT, handleCityChange);
    };
  }, []);

  const filteredHalls = useMemo(() => {
    const q = search.trim().toLowerCase();
    const selectedCityQuery = selectedCity.trim().toLowerCase();
    const isAllNepal = selectedCityQuery === ALL_NEPAL_CITY.toLowerCase();

    return halls.filter((hall) => {
      const hallLocation = (hall.hall_location || "").toLowerCase();
      const matchesSelectedCity = isAllNepal || !selectedCityQuery || hallLocation.includes(selectedCityQuery);
      if (!matchesSelectedCity) return false;

      const matchesSearch =
        !q ||
        [hall.hall_name, hall.hall_location, hall.hall_contact]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesSearch;
    });
  }, [halls, search, selectedCity]);

  const openHallChat = (hall) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setChatHall({ id: hall.id, name: hall.hall_name || "Cinema Hall" });
  };

  return (
    <section className="pb-8 pt-2 sm:pt-3" id="locations">
      <div className="container mx-auto px-6">
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2.5 }}>
          <Box sx={{ width: "100%", maxWidth: { xs: "100%", md: 360 } }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hall name, location, or contact..."
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  height: { xs: 42, md: 44 },
                  fontSize: 14,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={15} color="#94a3b8" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 999,
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.12)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.22)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e50914",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            Loading halls...
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            No halls match your search.
          </div>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
              gap: 2.5,
              justifyContent: "center",
            }}
          >
            {filteredHalls.map((hall, index) => (
              <motion.article
                key={hall.id || index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
                style={{ width: "100%", maxWidth: "680px", margin: "0 auto" }}
              >
                <Card sx={hallCardSurface}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "140px minmax(0, 1fr)" },
                      alignItems: "stretch",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={getHallPosterUrl(hall.hallPoster)}
                      alt={hall.hall_name || "Hall"}
                      sx={{
                        height: { xs: 135, sm: "100%" },
                        minHeight: { sm: 155 },
                        objectFit: "cover",
                      }}
                    />

                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <CardContent sx={{ p: 2.25, pb: 1.25 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", fontSize: "1rem" }}>
                            {hall.hall_name || "Cinema Hall"}
                          </Typography>
                          <Chip
                            label={hall.isActive ? "Open" : "Closed"}
                            size="small"
                            sx={{
                              borderRadius: 0,
                              fontWeight: 700,
                              color: hall.isActive ? "#6ee7b7" : "#fca5a5",
                              border: `1px solid ${hall.isActive ? "rgba(110,231,183,0.28)" : "rgba(252,165,165,0.26)"}`,
                              backgroundColor: hall.isActive
                                ? "rgba(16,185,129,0.12)"
                                : "rgba(239,68,68,0.12)",
                            }}
                          />
                        </Stack>

                        <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                          <Typography
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontSize: 13,
                              color: "rgba(255,255,255,0.72)",
                            }}
                          >
                            <MapPin size={15} color="#e50914" />
                            {hall.hall_location || "Location unavailable"}
                          </Typography>

                          <Stack direction="row" flexWrap="wrap" gap={1}>
                            <Chip
                              icon={<Users size={13} />}
                              label={`${hall.capacity || 0} seats`}
                              size="small"
                              sx={{
                                borderRadius: 0,
                                color: "rgba(255,255,255,0.78)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                backgroundColor: "rgba(255,255,255,0.04)",
                                "& .MuiChip-icon": { color: "rgba(255,255,255,0.64)" },
                              }}
                            />
                            <Chip
                              icon={<Phone size={13} />}
                              label={hall.hall_contact || "No contact"}
                              size="small"
                              sx={{
                                borderRadius: 0,
                                color: "rgba(255,255,255,0.78)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                backgroundColor: "rgba(255,255,255,0.04)",
                                "& .MuiChip-icon": { color: "rgba(255,255,255,0.64)" },
                              }}
                            />
                          </Stack>
                        </Stack>
                      </CardContent>

                      <CardActions sx={{ px: 2.25, pb: 2.25, pt: 0, gap: 1.25, flexWrap: "wrap" }}>
                        <Button
                          type="button"
                          onClick={() => navigate("/movies")}
                          variant="contained"
                          endIcon={<ArrowRight size={15} />}
                          sx={{
                            borderRadius: 0,
                            px: 2,
                            py: 1,
                            backgroundColor: "#e50914",
                            textTransform: "none",
                            fontWeight: 700,
                            "&:hover": { backgroundColor: "#c80811" },
                          }}
                        >
                          View Shows
                        </Button>
                        <Button
                          type="button"
                          onClick={() => openHallChat(hall)}
                          variant="outlined"
                          startIcon={<MessageCircle size={15} />}
                          sx={{
                            borderRadius: 0,
                            px: 2,
                            py: 1,
                            color: "#fff",
                            borderColor: "rgba(255,255,255,0.2)",
                            textTransform: "none",
                            fontWeight: 700,
                            "&:hover": {
                              borderColor: "#e50914",
                              backgroundColor: "rgba(229,9,20,0.08)",
                            },
                          }}
                        >
                          Chat
                        </Button>
                      </CardActions>
                    </Box>
                  </Box>
                </Card>
              </motion.article>
            ))}
          </Box>
        )}
      </div>

      <LiveChatModal
        isOpen={Boolean(chatHall)}
        onClose={() => setChatHall(null)}
        hallId={chatHall?.id}
        hallName={chatHall?.name}
        currentUserId={user?.id}
      />
    </section>
  );
};

export default Halls;
