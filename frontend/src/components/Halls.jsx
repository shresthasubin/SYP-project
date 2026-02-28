import React, { useEffect, useState } from "react";
import { MapPin, Phone, Users } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL, API_SERVER_URL } from "../config/api";

const FALLBACK_HALL_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop";

const getHallPosterUrl = (poster) => {
  if (!poster) return FALLBACK_HALL_IMAGE;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const isValidCoordinate = (value, min, max) =>
  Number.isFinite(value) && value >= min && value <= max;

const parseCoordinatesFromHall = (hall) => {
  const latCandidates = [hall.latitude, hall.lat, hall.hall_latitude];
  const lngCandidates = [hall.longitude, hall.lng, hall.lon, hall.hall_longitude];

  const latitude = latCandidates
    .map((value) => Number(value))
    .find((value) => isValidCoordinate(value, -90, 90));
  const longitude = lngCandidates
    .map((value) => Number(value))
    .find((value) => isValidCoordinate(value, -180, 180));

  if (latitude !== undefined && longitude !== undefined) {
    return [latitude, longitude];
  }

  return null;
};

const HallLocationMap = ({ hall }) => {
  const [position, setPosition] = useState(() => parseCoordinatesFromHall(hall));
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const directCoordinates = parseCoordinatesFromHall(hall);
    if (directCoordinates) {
      setPosition(directCoordinates);
      setIsResolving(false);
      return;
    }

    const locationText = hall.hall_location?.trim();
    if (!locationText) {
      setPosition(null);
      setIsResolving(false);
      return;
    }

    const controller = new AbortController();

    const resolveLocation = async () => {
      setIsResolving(true);
      try {
        const query = encodeURIComponent(locationText);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Geocoding failed with status ${response.status}`);
        }

        const results = await response.json();
        const bestMatch = results?.[0];

        if (bestMatch?.lat && bestMatch?.lon) {
          const latitude = Number(bestMatch.lat);
          const longitude = Number(bestMatch.lon);

          if (
            isValidCoordinate(latitude, -90, 90) &&
            isValidCoordinate(longitude, -180, 180)
          ) {
            setPosition([latitude, longitude]);
            return;
          }
        }

        setPosition(null);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to resolve hall coordinates", error);
          setPosition(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsResolving(false);
        }
      }
    };

    resolveLocation();
    return () => controller.abort();
  }, [hall]);

  if (isResolving) {
    return (
      <div className="h-48 w-full rounded-lg border border-white/10 bg-secondary/70 text-sm text-text-secondary flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  if (!position) {
    return (
      <div className="h-48 w-full rounded-lg border border-white/10 bg-secondary/70 text-sm text-text-secondary text-center px-4 flex items-center justify-center">
        Map unavailable for this hall location.
      </div>
    );
  }

  return (
    <div className="h-48 w-full overflow-hidden rounded-lg border border-white/10">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={position}
          radius={10}
          pathOptions={{ color: "#e50914", fillColor: "#e50914", fillOpacity: 0.9 }}
        >
          <Popup>{hall.hall_name || hall.hall_location || "Hall location"}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/hall/get`, {
          withCredentials: true,
        });
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

  return (
    <section className="py-10" id="locations">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Cinema Locations</h2>
            <p className="text-sm text-text-secondary">Explore halls, facilities, and map directions.</p>
          </div>
          <span className="rounded-full border border-white/15 bg-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
            {halls.length} halls
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            Loading halls...
          </div>
        ) : halls.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            No halls available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {halls.map((hall, index) => (
              <motion.article
                key={hall.id || index}
                className="overflow-hidden rounded-2xl border border-white/10 bg-secondary transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_12px_40px_rgba(229,9,20,0.16)]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <div className="grid gap-4 p-4 md:grid-cols-[220px,1fr]">
                  <img
                    src={getHallPosterUrl(hall.hallPoster)}
                    alt={hall.hall_name || "Hall"}
                    className="h-52 w-full rounded-xl object-cover md:h-full"
                  />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-text-primary">
                        {hall.hall_name || "Cinema Hall"}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          hall.isActive
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-rose-500/15 text-rose-500"
                        }`}
                      >
                        {hall.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="flex items-center gap-2 text-sm text-text-secondary">
                      <MapPin size={15} className="text-accent" />
                      {hall.hall_location || "Location unavailable"}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-primary/40 px-2.5 py-1 text-text-secondary">
                        <Users size={13} />
                        {hall.capacity || 0} Seats
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-primary/40 px-2.5 py-1 text-text-secondary">
                        <Phone size={13} />
                        {hall.hall_contact || "No contact"}
                      </span>
                    </div>

                    <HallLocationMap hall={hall} />

                    <button
                      type="button"
                      className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                    >
                      View Shows
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Halls;
