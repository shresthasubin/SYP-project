import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
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
