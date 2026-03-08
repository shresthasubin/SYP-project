import React, { useMemo, useState } from "react";
import { Armchair, CheckCircle2, AlertCircle, Building2, MapPin, LayoutGrid, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../../shared/config/api.js";
import { useAuth } from "../../../shared/hooks/useAuth.js";
import LocationPickerMap from "../../../shared/components/LocationPickerMap.jsx";

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
  seatTypes: {},
});

const getSeatKey = (rowIndex, seatIndex) => `${rowIndex}-${seatIndex}`;

const hasErrors = (obj) => Object.keys(obj).length > 0;

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-black/40 px-4 py-3 outline-none transition ${
    hasError
      ? "border-rose-400/70 focus:border-rose-400"
      : "border-white/15 focus:border-accent"
  }`;

const stepMeta = [
  { id: 1, label: "Details" },
  { id: 2, label: "Location" },
  { id: 3, label: "Hallrooms" },
  { id: 4, label: "Seat Layout" },
];

const HallStaffApply = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [hall, setHall] = useState(initialHall);
  const [rooms, setRooms] = useState([createRoom()]);
  const [step1Errors, setStep1Errors] = useState({});
  const [step2Errors, setStep2Errors] = useState({});
  const [step3Errors, setStep3Errors] = useState([]);
  const [step3FormError, setStep3FormError] = useState("");
  const [step4Error, setStep4Error] = useState("");
  const [seatBrush, setSeatBrush] = useState("regular");
  const [submitTrace, setSubmitTrace] = useState([]);

  const totalCapacity = useMemo(() => {
    return rooms.reduce((sum, room) => {
      const total = Number(room.rows) * Number(room.seatsPerRow);
      const blocked = room.emptySeats.length;
      return sum + Math.max(total - blocked, 0);
    }, 0);
  }, [rooms]);

  const validateStep1 = () => {
    const errors = {};
    const hallName = hall.hall_name.trim();
    const contact = hall.hall_contact.trim();
    const license = hall.license.trim();

    if (!hallName) errors.hall_name = "Hall name is required.";
    else if (hallName.length > 20) errors.hall_name = "Maximum 20 characters.";

    if (!contact) errors.hall_contact = "Hall contact is required.";
    else if (!/^\d{10}$/.test(contact))
      errors.hall_contact = "Hall contact must be exactly 10 digits.";

    if (!license) errors.license = "License is required.";
    else if (!/^091-\d{8}$/.test(license))
      errors.license = "License must match 091-XXXXXXXX.";

    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    const location = hall.hall_location.trim();
    if (!location) errors.hall_location = "Hall location is required.";
    else if (location.length > 50)
      errors.hall_location = "Maximum 50 characters.";
    return errors;
  };

  const validateStep3 = () => {
    if (!rooms.length) {
      return {
        formError: "At least one room is required.",
        roomErrors: [],
      };
    }

    const roomErrors = rooms.map((room) => {
      const e = {};
      if (!room.roomName.trim()) e.roomName = "Room name is required.";
      if (!Number.isInteger(Number(room.rows)) || Number(room.rows) <= 0)
        e.rows = "Rows must be a positive number.";
      if (
        !Number.isInteger(Number(room.seatsPerRow)) ||
        Number(room.seatsPerRow) <= 0
      ) {
        e.seatsPerRow = "Seats per row must be a positive number.";
      }
      return e;
    });

    return {
      formError: roomErrors.some(hasErrors)
        ? "Fix room errors before continuing."
        : "",
      roomErrors,
    };
  };

  const validateStep4 = () => {
    if (totalCapacity <= 0) {
      return "Total available capacity must be greater than 0.";
    }
    return "";
  };

  const updateRoom = (index, updates) => {
    setRooms((prev) =>
      prev.map((room, i) => (i === index ? { ...room, ...updates } : room)),
    );
  };

  const addRoom = () => setRooms((prev) => [...prev, createRoom()]);

  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const applySeatBrush = (roomIndex, rowIndex, seatIndex) => {
    const seatKey = getSeatKey(rowIndex, seatIndex);
    const room = rooms[roomIndex];
    const emptySet = new Set(room.emptySeats);
    const seatTypes = { ...(room.seatTypes || {}) };

    if (seatBrush === "blocked") {
      emptySet.add(seatKey);
      delete seatTypes[seatKey];
    } else {
      emptySet.delete(seatKey);
      seatTypes[seatKey] = seatBrush === "premium" ? "premium" : "regular";
    }

    updateRoom(roomIndex, { emptySeats: Array.from(emptySet), seatTypes });
  };

  const goToStep2 = () => {
    const errors = validateStep1();
    setStep1Errors(errors);
    if (hasErrors(errors)) {
      toast.error("Step 1 has validation errors.");
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    const errors = validateStep2();
    setStep2Errors(errors);
    if (hasErrors(errors)) {
      toast.error("Step 2 has validation errors.");
      return;
    }
    setStep(3);
  };

  const goToStep4 = () => {
    const { roomErrors, formError } = validateStep3();
    setStep3Errors(roomErrors);
    setStep3FormError(formError);
    if (formError) {
      toast.error("Step 3 has validation errors.");
      return;
    }
    setStep(4);
  };

  const submitApplication = async () => {
    const trace = [];
    const tracePush = (text) => trace.push(text);

    const s1 = validateStep1();
    setStep1Errors(s1);
    if (hasErrors(s1)) {
      setStep(1);
      tracePush("Step 1 failed validation.");
      setSubmitTrace(trace);
      toast.error("Please fix Step 1 errors.");
      return;
    }
    tracePush("Step 1 passed.");

    const s2 = validateStep2();
    setStep2Errors(s2);
    if (hasErrors(s2)) {
      setStep(2);
      tracePush("Step 2 failed validation.");
      setSubmitTrace(trace);
      toast.error("Please fix Step 2 errors.");
      return;
    }
    tracePush("Step 2 passed.");

    const s3 = validateStep3();
    setStep3Errors(s3.roomErrors);
    setStep3FormError(s3.formError);
    if (s3.formError) {
      setStep(3);
      tracePush("Step 3 failed validation.");
      setSubmitTrace(trace);
      toast.error("Please fix Step 3 errors.");
      return;
    }
    tracePush("Step 3 passed.");

    const s4 = validateStep4();
    setStep4Error(s4);
    if (s4) {
      setStep(4);
      tracePush("Step 4 failed validation.");
      setSubmitTrace(trace);
      toast.error("Please fix Step 4 errors.");
      return;
    }
    tracePush("Step 4 passed.");

    setSubmitting(true);
    try {
      tracePush("Submitting to server...");
      const payload = new FormData();
      payload.append("hall_name", hall.hall_name.trim());
      payload.append("hall_location", hall.hall_location.trim());
      payload.append("hall_contact", hall.hall_contact.trim());
      payload.append("license", hall.license.trim());
      if (hall.hallPoster) payload.append("hallPoster", hall.hallPoster);
      payload.append("hallrooms", JSON.stringify(rooms));
      payload.append("totalCapacity", String(totalCapacity));

      const response = await axios.post(`${API_BASE_URL}/hall/apply`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        tracePush("Server accepted application.");
        setSubmitTrace(trace);
        toast.success("Application submitted for admin verification");
        setStep(1);
        setHall(initialHall);
        setRooms([createRoom()]);
        setStep1Errors({});
        setStep2Errors({});
        setStep3Errors([]);
        setStep3FormError("");
        setStep4Error("");
        return;
      }
    } catch (error) {
      const data = error.response?.data;
      const firstDetail = Array.isArray(data?.details) ? data.details[0] : null;
      const detailedMessage = firstDetail
        ? `${firstDetail.field}: ${firstDetail.message}`
        : [data?.message, data?.error].filter(Boolean).join(" - ");
      tracePush(`Server rejected: ${detailedMessage || "Unknown error"}`);
      setSubmitTrace(trace);
      toast.error(detailedMessage || "Application failed");
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

  const progress = (step / 4) * 100;

  return (
    <section className="container mx-auto max-w-6xl px-6 py-10 text-text-primary">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-secondary p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_45%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Building2 size={14} />
              Partner Onboarding
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">Hall Staff Application</h1>
            <p className="mt-2 text-sm text-slate-300">
              Join our system with your hall. Complete all phases with validation checks before submission.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
            <p className="text-slate-400">Applying as</p>
            <p className="font-semibold text-white">{user?.fullname || user?.email || "User"}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded bg-white/10">
          <div
            className="h-2 rounded bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {stepMeta.map((s) => (
            <span
              key={s.id}
              className={`rounded-full border px-3 py-1 ${
                s.id < step
                  ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                  : s.id === step
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-white/15 text-slate-300"
              }`}
            >
              {s.id}. {s.label}
            </span>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Phase 1: Hall Details</h2>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Hall Name</label>
          <input
            value={hall.hall_name}
            onChange={(e) => setHall((p) => ({ ...p, hall_name: e.target.value }))}
            placeholder="Hall name"
            className={inputClass(Boolean(step1Errors.hall_name))}
          />
          {step1Errors.hall_name ? (
            <p className="text-xs text-rose-300">{step1Errors.hall_name}</p>
          ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Hall Contact</label>
          <input
            value={hall.hall_contact}
            onChange={(e) => setHall((p) => ({ ...p, hall_contact: e.target.value }))}
            placeholder="Hall contact (10 digits)"
            maxLength={10}
            className={inputClass(Boolean(step1Errors.hall_contact))}
          />
          {step1Errors.hall_contact ? (
            <p className="text-xs text-rose-300">{step1Errors.hall_contact}</p>
          ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">License Number</label>
          <input
            value={hall.license}
            onChange={(e) => setHall((p) => ({ ...p, license: e.target.value }))}
            placeholder="License (091-XXXXXXXX)"
            maxLength={12}
            className={inputClass(Boolean(step1Errors.license))}
          />
          {step1Errors.license ? (
            <p className="text-xs text-rose-300">{step1Errors.license}</p>
          ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Hall Poster (Optional)</label>
            <div className="rounded-lg border border-white/15 bg-black/40 px-4 py-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                <Upload size={14} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setHall((p) => ({ ...p, hallPoster: e.target.files?.[0] || null }))
                  }
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-xs text-slate-400">
                {hall.hallPoster ? `Selected: ${hall.hallPoster.name}` : "No image selected"}
              </p>
            </div>
          </div>

          <button
            onClick={goToStep2}
            className="rounded-lg bg-accent px-5 py-3 font-semibold text-white"
          >
            Next: Location
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
            <MapPin size={18} className="text-accent" />
            Phase 2: Hall Location
          </h2>
          <input
            value={hall.hall_location}
            onChange={(e) => setHall((p) => ({ ...p, hall_location: e.target.value }))}
            placeholder="Search or click map to set hall location"
            className={inputClass(Boolean(step2Errors.hall_location))}
          />
          {step2Errors.hall_location ? (
            <p className="text-xs text-rose-300">{step2Errors.hall_location}</p>
          ) : null}

          <LocationPickerMap
            locationValue={hall.hall_location}
            onLocationSelect={(nextLocation) =>
              setHall((p) => ({ ...p, hall_location: nextLocation }))
            }
          />

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              onClick={goToStep3}
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-white"
            >
              Next: Hallrooms
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
              <LayoutGrid size={18} className="text-accent" />
              Phase 3: Hall Rooms
            </h2>
            <button
              onClick={addRoom}
              className="rounded-md border border-accent px-3 py-2 text-sm text-accent"
            >
              + Add Room
            </button>
          </div>

          {step3FormError ? (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {step3FormError}
            </div>
          ) : null}

          <div className="mt-4 space-y-4">
            {rooms.map((room, idx) => {
              const errors = step3Errors[idx] || {};
              return (
                <div key={idx} className="rounded-lg border border-white/10 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Room {idx + 1}
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <input
                        value={room.roomName}
                        onChange={(e) => updateRoom(idx, { roomName: e.target.value })}
                        placeholder="Room name"
                        className={inputClass(Boolean(errors.roomName))}
                      />
                      {errors.roomName ? (
                        <p className="mt-1 text-xs text-rose-300">{errors.roomName}</p>
                      ) : null}
                    </div>
                    <div>
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
                        placeholder="Rows"
                        className={inputClass(Boolean(errors.rows))}
                      />
                      {errors.rows ? (
                        <p className="mt-1 text-xs text-rose-300">{errors.rows}</p>
                      ) : null}
                    </div>
                    <div>
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
                        placeholder="Seats per row"
                        className={inputClass(Boolean(errors.seatsPerRow))}
                      />
                      {errors.seatsPerRow ? (
                        <p className="mt-1 text-xs text-rose-300">{errors.seatsPerRow}</p>
                      ) : null}
                    </div>
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
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-white/20 px-5 py-3"
            >
              Back
            </button>
            <button
              onClick={goToStep4}
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-white"
            >
              Next: Seat Layout
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-xl font-semibold">Phase 4: Seat Layout Builder</h2>
          <p className="mt-1 text-sm text-slate-300">Select a brush and click seats to apply.</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
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
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border border-pink-400/30 bg-pink-400/10 px-3 py-1 text-pink-300">
              <Armchair size={12} /> Regular
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-amber-300">
              <Armchair size={12} /> Premium
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-slate-300">
              <Armchair size={12} /> Blocked
            </span>
          </div>

          {step4Error ? (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {step4Error}
            </div>
          ) : null}

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
                              const seatType = room.seatTypes?.[key] === "premium" ? "premium" : "regular";
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() =>
                                    applySeatBrush(roomIndex, rowIndex, seatIndex)
                                  }
                                  className="p-0.5 transition-transform hover:scale-110"
                                  title={`${String.fromCharCode(65 + rowIndex)}${seatIndex + 1} - ${isEmpty ? "blocked" : seatType}`}
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

          <div className="mt-6 rounded-lg border border-emerald-600/30 bg-emerald-900/20 p-4">
            <p className="text-sm text-emerald-200">Total calculated capacity: {totalCapacity}</p>
          </div>

          {submitTrace.length > 0 ? (
            <div className="mt-6 rounded-lg border border-white/10 bg-black/40 p-4">
              <p className="mb-2 text-sm font-semibold">Submission Diagnostics</p>
              <div className="space-y-2">
                {submitTrace.map((line, idx) => {
                  const isFail = line.toLowerCase().includes("failed") || line.toLowerCase().includes("rejected");
                  return (
                    <div key={`${line}-${idx}`} className="flex items-start gap-2 text-xs">
                      {isFail ? (
                        <AlertCircle size={14} className="mt-0.5 text-rose-400" />
                      ) : (
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-400" />
                      )}
                      <span className={isFail ? "text-rose-300" : "text-slate-300"}>{line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep(3)}
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
