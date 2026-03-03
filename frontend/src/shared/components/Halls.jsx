import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, Users, MessageCircle, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_SERVER_URL } from "../config/api";
import { useAuth } from "../hooks/useAuth.js";
import LiveChatModal from "../../features/chat/components/LiveChatModal.jsx";

const FALLBACK_HALL_IMAGE =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1400&auto=format&fit=crop";

const getHallPosterUrl = (poster) => {
  if (!poster) return FALLBACK_HALL_IMAGE;
  if (/^https?:\/\//i.test(poster)) return poster;
  return `${API_SERVER_URL}/uploads/${poster}`;
};

const Halls = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [chatHall, setChatHall] = useState(null);

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

  const filteredHalls = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return halls;
    return halls.filter((hall) =>
      [hall.hall_name, hall.hall_location, hall.hall_contact]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [halls, search]);

  const openHallChat = (hall) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setChatHall({ id: hall.id, name: hall.hall_name || "Cinema Hall" });
  };

  return (
    <section className="py-10" id="locations">
      <div className="container mx-auto px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Cinema Locations</h2>
            <p className="text-sm text-text-secondary">Explore halls, view shows, and chat directly with hall admins.</p>
          </div>
          <span className="rounded-full border border-white/15 bg-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
            {filteredHalls.length} / {halls.length} halls
          </span>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by hall name, location, or contact..."
              className="w-full rounded-xl border border-white/10 bg-secondary py-2.5 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-accent"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            Loading halls...
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-secondary p-8 text-sm text-text-secondary">
            No halls match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredHalls.map((hall, index) => (
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

                  

                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => navigate("/movies")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
                      >
                        View Shows <ArrowRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openHallChat(hall)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-primary/40 px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-accent"
                      >
                        <MessageCircle size={15} />
                        Chat with Hall
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
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
