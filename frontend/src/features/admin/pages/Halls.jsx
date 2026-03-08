import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Upload, MapPin, Phone, Users, Armchair, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import LocationPickerMap from "../../../shared/components/LocationPickerMap.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || "http://localhost:3000";

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

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingHall, setEditingHall] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [rooms, setRooms] = useState([createRoom()]);
  const [seatBrush, setSeatBrush] = useState("regular");

  useEffect(() => {
    fetchHalls();
  }, []);

  const totalCapacity = useMemo(() => {
    return rooms.reduce((sum, room) => {
      const total = Number(room.rows) * Number(room.seatsPerRow);
      return sum + Math.max(total - room.emptySeats.length, 0);
    }, 0);
  }, [rooms]);

  const fetchHalls = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hall/get`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setHalls(response.data.data);
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
  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

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

  const canProceedDetails =
    formData.hall_name.trim() &&
    formData.hall_contact.trim() &&
    formData.license.trim();
  const canProceedLocation = formData.hall_location.trim();

  const validateRooms = () => {
    if (!rooms.length) return false;
    return rooms.every(
      (room) => room.roomName.trim() && Number(room.rows) > 0 && Number(room.seatsPerRow) > 0,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("hall_name", formData.hall_name);
    data.append("hall_location", formData.hall_location);
    data.append("hall_contact", formData.hall_contact);
    data.append("license", formData.license);
    if (formData.hallPoster) data.append("hallPoster", formData.hallPoster);

    if (!editingHall) {
      data.append("hallrooms", JSON.stringify(rooms));
      data.append("totalCapacity", String(totalCapacity));
    }

    try {
      if (editingHall) {
        await axios.put(`${API_BASE_URL}/hall/update/${editingHall.id}`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hall updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/hall/register`, data, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hall registered successfully");
      }
      setShowModal(false);
      resetForm();
      fetchHalls();
    } catch (error) {
      console.error("Hall register/update failed:", error.response?.data || error.message);
      const detailMessage = error.response?.data?.details?.[0]?.message;
      toast.error(
        detailMessage ||
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Operation failed",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this hall?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/hall/delete/${id}`, {
        withCredentials: true,
      });
      toast.success("Hall deactivated successfully");
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

  const getPosterUrl = (poster) => (poster ? `${API_SERVER_URL}/uploads/${poster}` : "");

  const openCreateModal = () => {
    resetForm();
    setStep(1);
    setShowModal(true);
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
    setStep(1);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setRooms([createRoom()]);
    setEditingHall(null);
    setStep(1);
  };

  const filteredHalls = halls.filter((hall) =>
    (hall.hall_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Halls</h1>
          <p className="mt-2 text-slate-400">Manage your cinema halls</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-[#D72626] px-4 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
        >
          <Plus size={20} />
          Add Hall
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search halls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl bg-black border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-[#D72626] focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-slate-300">Loading halls...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHalls.map((hall) => (
            <div
              key={hall.id}
              className={`group relative overflow-hidden rounded-xl bg-black border ${
                hall.isActive ? "border-white/10" : "border-red-900/50 opacity-75"
              } transition-all hover:border-[#D72626]/50`}
            >
              <div className="aspect-video w-full bg-slate-800 relative">
                {hall.hallPoster ? (
                  <img src={getPosterUrl(hall.hallPoster)} alt={hall.hall_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <MapPin size={48} className="text-slate-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 text-xs text-white">
                  {hall.isActive ? "Active" : "Inactive"}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEditModal(hall)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  {hall.isActive && (
                    <button
                      onClick={() => handleDelete(hall.id)}
                      className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  {!hall.isActive && (
                    <button
                      onClick={() => handleActivate(hall)}
                      className="p-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition-colors"
                      title="Activate Hall"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-white text-lg">{hall.hall_name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={16} className="text-[#D72626]" />
                  <span className="truncate">{hall.hall_location}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{hall.hall_contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{hall.capacity ?? "-"} Seats</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-2xl bg-[#1a1a1a] p-6 shadow-xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingHall ? "Edit Hall" : "Add New Hall"}</h2>
                {!editingHall && (
                  <div className="mt-2 flex gap-2 text-xs">
                    {[1, 2, 3, 4].map((s) => (
                      <span
                        key={s}
                        className={`rounded-full border px-3 py-1 ${
                          s === step ? "border-[#D72626] bg-[#D72626]/20 text-[#D72626]" : "border-white/15 text-slate-300"
                        }`}
                      >
                        Step {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {(editingHall || step === 1) && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Hall Name</label>
                    <input
                      type="text"
                      name="hall_name"
                      value={formData.hall_name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Contact</label>
                    <input
                      type="text"
                      name="hall_contact"
                      value={formData.hall_contact}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">License Number</label>
                    <input
                      type="text"
                      name="license"
                      value={formData.license}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-300">Hall Poster</label>
                    <div className="relative">
                      <input
                        type="file"
                        name="hallPoster"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        id="hall-poster-upload"
                      />
                      <label
                        htmlFor="hall-poster-upload"
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 bg-black/50 p-4 text-slate-400 hover:border-[#D72626]/50 hover:text-[#D72626] transition-colors"
                      >
                        <Upload size={20} />
                        <span>{formData.hallPoster ? formData.hallPoster.name : "Upload Hall Image"}</span>
                      </label>
                    </div>
                  </div>
                  {editingHall && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-300">Location</label>
                        <input
                          type="text"
                          name="hall_location"
                          value={formData.hall_location}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-300">Pick Location On Map</label>
                        <LocationPickerMap
                          key={`${editingHall?.id || "edit"}-${showModal ? "open" : "closed"}`}
                          locationValue={formData.hall_location}
                          onLocationSelect={(nextLocation) =>
                            setFormData((prev) => ({ ...prev, hall_location: nextLocation }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {!editingHall && step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Hall Location</h3>
                  <input
                    type="text"
                    name="hall_location"
                    value={formData.hall_location}
                    onChange={handleInputChange}
                    placeholder="Search or click the map to set hall location"
                    required
                    className="w-full rounded-lg bg-black border border-white/10 p-3 text-white focus:border-[#D72626] focus:outline-none"
                  />
                  <LocationPickerMap
                    key={`create-location-${showModal ? "open" : "closed"}`}
                    locationValue={formData.hall_location}
                    onLocationSelect={(nextLocation) =>
                      setFormData((prev) => ({ ...prev, hall_location: nextLocation }))
                    }
                  />
                </div>
              )}

              {!editingHall && step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Hall Rooms</h3>
                    <button
                      type="button"
                      onClick={addRoom}
                      className="rounded-md border border-[#D72626] px-3 py-2 text-sm text-[#D72626]"
                    >
                      + Add Room
                    </button>
                  </div>

                  {rooms.map((room, idx) => (
                    <div key={idx} className="rounded-lg border border-white/10 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          value={room.roomName}
                          onChange={(e) => updateRoom(idx, { roomName: e.target.value })}
                          placeholder="Room Name"
                          className="rounded-lg bg-black border border-white/10 p-3 text-white"
                        />
                        <input
                          type="number"
                          min={1}
                          value={room.rows}
                          onChange={(e) =>
                            updateRoom(idx, {
                              rows: Number(e.target.value) || 1,
                              emptySeats: [],
                              seatTypes: {},
                            })
                          }
                          className="rounded-lg bg-black border border-white/10 p-3 text-white"
                        />
                        <input
                          type="number"
                          min={1}
                          value={room.seatsPerRow}
                          onChange={(e) =>
                            updateRoom(idx, {
                              seatsPerRow: Number(e.target.value) || 1,
                              emptySeats: [],
                              seatTypes: {},
                            })
                          }
                          className="rounded-lg bg-black border border-white/10 p-3 text-white"
                        />
                      </div>
                      {rooms.length > 1 && (
                        <button type="button" onClick={() => removeRoom(idx)} className="mt-3 text-sm text-red-400">
                          Remove room
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!editingHall && step === 4 && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-emerald-600/30 bg-emerald-900/20 p-3 text-sm text-emerald-200">
                    Calculated total capacity: {totalCapacity}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-300">Brush:</span>
                    <button
                      type="button"
                      onClick={() => setSeatBrush("regular")}
                      className={`rounded border px-3 py-1 ${seatBrush === "regular" ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-white/15 text-slate-300"}`}
                    >
                      Regular
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeatBrush("premium")}
                      className={`rounded border px-3 py-1 ${seatBrush === "premium" ? "border-amber-400 bg-amber-500/20 text-amber-300" : "border-white/15 text-slate-300"}`}
                    >
                      Premium
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeatBrush("blocked")}
                      className={`rounded border px-3 py-1 ${seatBrush === "blocked" ? "border-slate-400 bg-slate-500/20 text-slate-200" : "border-white/15 text-slate-300"}`}
                    >
                      Blocked
                    </button>
                  </div>
                  {rooms.map((room, roomIndex) => {
                    const rows = Number(room.rows);
                    const seats = Number(room.seatsPerRow);
                    const available = rows * seats - room.emptySeats.length;
                    return (
                      <div key={roomIndex} className="rounded-lg border border-white/10 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-semibold text-white">{room.roomName || `Room ${roomIndex + 1}`}</h4>
                          <span className="text-sm text-slate-300">
                            {available}/{rows * seats} available
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <div className="inline-flex flex-col gap-2">
                            {Array.from({ length: rows }).map((_, rowIndex) => (
                              <div key={rowIndex} className="flex items-center gap-2">
                                <span className="w-6 text-xs text-slate-300">{String.fromCharCode(65 + rowIndex)}</span>
                                <div className="flex gap-1">
                                  {Array.from({ length: seats }).map((__, colIndex) => {
                                    const key = seatKey(rowIndex, colIndex);
                                    const isEmpty = room.emptySeats.includes(key);
                                    const seatType = room.seatTypes?.[key] === "premium" ? "premium" : "regular";
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        onClick={() => applySeatBrush(roomIndex, rowIndex, colIndex)}
                                        className="p-0.5 transition-transform hover:scale-110"
                                        title={`${String.fromCharCode(65 + rowIndex)}${colIndex + 1} - ${isEmpty ? "blocked" : seatType}`}
                                      >
                                        <Armchair
                                          size={16}
                                          className={
                                            isEmpty
                                              ? "text-slate-600 opacity-50"
                                              : seatType === "premium"
                                                ? "text-amber-400"
                                                : "text-pink-400"
                                          }
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                {!editingHall && step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-lg px-6 py-2 font-medium text-slate-300 hover:text-white"
                  >
                    Back
                  </button>
                )}
                {!editingHall && step < 4 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={
                      (step === 1 && !canProceedDetails) ||
                      (step === 2 && !canProceedLocation) ||
                      (step === 3 && !validateRooms())
                    }
                    className="rounded-lg bg-[#D72626] px-6 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                )}
                {(editingHall || step === 4) && (
                  <button
                    type="submit"
                    className="rounded-lg bg-[#D72626] px-6 py-2 font-semibold text-white hover:bg-[#D72626]/90 transition-colors"
                  >
                    {editingHall ? "Update Hall" : "Create Hall"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Halls;
