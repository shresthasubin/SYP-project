import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL, API_SERVER_URL } from "../config/api";
import "../index.css";

const FALLBACK_HALL_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop";

const getHallPosterUrl = (poster) => {
  if (!poster) return FALLBACK_HALL_IMAGE;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const getHallFeatures = (hall) => {
  const features = [];

  if (hall.capacity) {
    features.push(`${hall.capacity} Seats`);
  }

  if (hall.hall_contact) {
    features.push("Contact Available");
  }

  features.push(hall.isActive ? "Active" : "Inactive");

  return features;
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
          }
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
      <div className="h-52 w-full rounded-lg border border-white/10 bg-secondary flex items-center justify-center text-sm text-text-secondary">
        Loading map...
      </div>
    );
  }

  if (!position) {
    return (
      <div className="h-52 w-full rounded-lg border border-white/10 bg-secondary flex items-center justify-center text-sm text-text-secondary text-center px-4">
        Map unavailable for this hall location.
      </div>
    );
  }

  return (
    <div className="h-52 w-full rounded-lg overflow-hidden border border-white/10">
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
    <section className="py-16 bg-secondary" id="locations">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <span className="text-accent">Our</span> Cinemas
          </h2>
          <p className="text-text-secondary">
            Experience movies at our premium locations
          </p>
        </div>

        {loading ? (
          <p className="text-text-secondary">Loading halls...</p>
        ) : halls.length === 0 ? (
          <p className="text-text-secondary">No halls available right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {halls.map((hall, index) => (
              <motion.div
                key={hall.id || index}
                className="bg-primary rounded-xl overflow-hidden border border-white/5 hover:-translate-y-2 hover:shadow-xl hover:border-accent transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <img
                  src={getHallPosterUrl(hall.hallPoster)}
                  alt={hall.hall_name || "Hall"}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-text-primary">
                    {hall.hall_name || "Cinema Hall"}
                  </h3>
                  <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                    <MapPin size={16} className="text-accent" />
                    <span>{hall.hall_location || "Location unavailable"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {getHallFeatures(hall).map((feature) => (
                      <span
                        key={feature}
                        className="bg-white/5 text-text-secondary px-3 py-1 rounded text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mb-6">
                    <HallLocationMap hall={hall} />
                  </div>
                  <button className="w-full py-3 border border-white/20 text-text-primary rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors">
                    View Shows
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Halls;
