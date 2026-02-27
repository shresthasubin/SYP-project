import React, { useMemo, useState } from "react";
import { Armchair } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config/api.js";
import { useAuth } from "../hooks/useAuth.js";

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
});

const getSeatKey = (rowIndex, seatIndex) => `${rowIndex}-${seatIndex}`;

const HallStaffApply = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [hall, setHall] = useState(initialHall);
  const [rooms, setRooms] = useState([createRoom()]);

  const canProceedStep1 = useMemo(() => {
    return (
      hall.hall_name.trim() &&
      hall.hall_location.trim() &&
      hall.hall_contact.trim() &&
      hall.license.trim()
    );
  }, [hall]);

  const totalCapacity = useMemo(() => {
    return rooms.reduce((sum, room) => {
      const total = Number(room.rows) * Number(room.seatsPerRow);
      const blocked = room.emptySeats.length;
      return sum + Math.max(total - blocked, 0);
    }, 0);
  }, [rooms]);

  const updateRoom = (index, updates) => {
    setRooms((prev) =>
      prev.map((room, i) => (i === index ? { ...room, ...updates } : room)),
    );
  };

  const addRoom = () => setRooms((prev) => [...prev, createRoom()]);

  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleEmptySeat = (roomIndex, rowIndex, seatIndex) => {
    const seatKey = getSeatKey(rowIndex, seatIndex);
    const room = rooms[roomIndex];
    const exists = room.emptySeats.includes(seatKey);
    const next = exists
      ? room.emptySeats.filter((key) => key !== seatKey)
      : [...room.emptySeats, seatKey];
    updateRoom(roomIndex, { emptySeats: next });
  };

  const validateRooms = () => {
    if (!rooms.length) return false;
    return rooms.every(
      (room) =>
        room.roomName.trim() &&
        Number(room.rows) > 0 &&
        Number(room.seatsPerRow) > 0,
    );
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("hall_name", hall.hall_name);
      payload.append("hall_location", hall.hall_location);
      payload.append("hall_contact", hall.hall_contact);
      payload.append("license", hall.license);
      if (hall.hallPoster) payload.append("hallPoster", hall.hallPoster);
      payload.append("hallrooms", JSON.stringify(rooms));
      payload.append("totalCapacity", String(totalCapacity));

      const response = await axios.post(`${API_BASE_URL}/hall/apply`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Application submitted for admin verification");
        setStep(1);
        setHall(initialHall);
        setRooms([createRoom()]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container mx-auto px-6 py-12">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 text-text-primary">
        Please login to apply as hall staff.
      </div>
    );
  }

  if (user?.role !== "user") {
    return (
      <div className="container mx-auto px-6 py-12 text-text-primary">
        This form is only for users with `user` role.
      </div>
    );
  }

  return (
    <section className="container mx-auto max-w-6xl px-6 py-10 text-text-primary">
      <h1 className="text-3xl font-bold">Hall Staff Application</h1>
      <p className="mt-2 text-sm text-slate-300">
        Complete all steps. Your profile is upgraded after admin approval.
      </p>

      <div className="mt-6 flex gap-2 text-xs">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`rounded-full border px-3 py-1 ${
              s === step
                ? "border-accent bg-accent/20 text-accent"
                : "border-white/15 text-slate-300"
            }`}
          >
            Step {s}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Hall Details</h2>
          <input
            value={hall.hall_name}
            onChange={(e) => setHall((p) => ({ ...p, hall_name: e.target.value }))}
            placeholder="Hall name"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3"
          />
          <input
            value={hall.hall_location}
            onChange={(e) => setHall((p) => ({ ...p, hall_location: e.target.value }))}
            placeholder="Hall location"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3"
          />
          <input
            value={hall.hall_contact}
            onChange={(e) => setHall((p) => ({ ...p, hall_contact: e.target.value }))}
            placeholder="Hall contact (10 digits)"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3"
          />
          <input
            value={hall.license}
            onChange={(e) => setHall((p) => ({ ...p, license: e.target.value }))}
            placeholder="License (091-XXXXXXXX)"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setHall((p) => ({ ...p, hallPoster: e.target.files?.[0] || null }))
            }
            className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-white"
          />

          <button
            disabled={!canProceedStep1}
            onClick={() => setStep(2)}
            className="rounded-lg bg-accent px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            Next: Hallrooms
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Hall Rooms</h2>
            <button
              onClick={addRoom}
              className="rounded-md border border-accent px-3 py-2 text-sm text-accent"
            >
              + Add Room
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {rooms.map((room, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={room.roomName}
                    onChange={(e) => updateRoom(idx, { roomName: e.target.value })}
                    placeholder="Room name"
                    className="rounded-lg border border-white/15 bg-black/40 px-4 py-3"
                  />
                  <input
                    type="number"
                    min={1}
                    value={room.rows}
                    onChange={(e) =>
                      updateRoom(idx, {
                        rows: Number(e.target.value) || 1,
                        emptySeats: [],
                      })
                    }
                    placeholder="Rows"
                    className="rounded-lg border border-white/15 bg-black/40 px-4 py-3"
                  />
                  <input
                    type="number"
                    min={1}
                    value={room.seatsPerRow}
                    onChange={(e) =>
                      updateRoom(idx, {
                        seatsPerRow: Number(e.target.value) || 1,
                        emptySeats: [],
                      })
                    }
                    placeholder="Seats per row"
                    className="rounded-lg border border-white/15 bg-black/40 px-4 py-3"
                  />
                </div>
                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(idx)}
                    className="mt-3 text-sm text-rose-300"
                  >
                    Remove room
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              disabled={!validateRooms()}
              onClick={() => setStep(3)}
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              Next: Seat Layout
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Seat Layout Builder</h2>
          <p className="mt-1 text-sm text-slate-300">
            Click a seat to mark it blocked/empty.
          </p>

          <div className="mt-6 space-y-6">
            {rooms.map((room, roomIndex) => {
              const rows = Number(room.rows);
              const seatsPerRow = Number(room.seatsPerRow);
              const available = rows * seatsPerRow - room.emptySeats.length;
              return (
                <div key={roomIndex} className="rounded-xl border border-white/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold">{room.roomName || `Room ${roomIndex + 1}`}</h3>
                    <span className="text-sm text-slate-300">
                      Available: {available} / {rows * seatsPerRow}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="inline-flex flex-col gap-2">
                      {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex items-center gap-2">
                          <span className="w-6 text-xs text-slate-300">
                            {String.fromCharCode(65 + rowIndex)}
                          </span>
                          <div className="flex gap-1">
                            {Array.from({ length: seatsPerRow }).map((__, seatIndex) => {
                              const key = getSeatKey(rowIndex, seatIndex);
                              const isEmpty = room.emptySeats.includes(key);
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() =>
                                    toggleEmptySeat(roomIndex, rowIndex, seatIndex)
                                  }
                                  className="p-0.5 transition-transform hover:scale-110"
                                  title={`${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`}
                                >
                                  <Armchair
                                    size={16}
                                    className={isEmpty ? "text-slate-600 opacity-50" : "text-pink-400"}
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

          <div className="mt-6 rounded-lg border border-emerald-600/30 bg-emerald-900/20 p-4">
            <p className="text-sm text-emerald-200">Total calculated capacity: {totalCapacity}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              onClick={submitApplication}
              disabled={submitting}
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit For Admin Verification"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HallStaffApply;
