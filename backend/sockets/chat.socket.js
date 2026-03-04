const onlineUsers = new Map();
<<<<<<< HEAD
const getShowtimeRoom = (showtimeId) => `showtime:${showtimeId}`;

const HOLD_TTL_MS = 45_000;
// showtimeId -> Map(seatId -> { userId, socketId, updatedAt })
const showtimeSeatHolds = new Map();
// socketId -> Map(showtimeId -> Set(seatId))
const socketSelections = new Map();

const normalizeSeatIds = (seatIds) =>
    Array.isArray(seatIds)
        ? [...new Set(
            seatIds
                .map((seatId) => Number(seatId))
                .filter((seatId) => Number.isInteger(seatId) && seatId > 0),
        )]
        : [];

const getSeatHoldMap = (showtimeId) => {
    const key = Number(showtimeId);
    if (!showtimeSeatHolds.has(key)) {
        showtimeSeatHolds.set(key, new Map());
    }
    return showtimeSeatHolds.get(key);
};

const getSocketSelectionMap = (socketId) => {
    if (!socketSelections.has(socketId)) {
        socketSelections.set(socketId, new Map());
    }
    return socketSelections.get(socketId);
};

const cleanupExpiredHolds = (showtimeId) => {
    const holdMap = getSeatHoldMap(showtimeId);
    const now = Date.now();

    for (const [seatId, hold] of holdMap.entries()) {
        if (!hold || now - Number(hold.updatedAt || 0) > HOLD_TTL_MS) {
            holdMap.delete(seatId);
        }
    }
};

const buildHeldSeatsPayload = (showtimeId) => {
    cleanupExpiredHolds(showtimeId);
    const holdMap = getSeatHoldMap(showtimeId);
    const holds = Array.from(holdMap.entries()).map(([seatId, hold]) => ({
        seatId: Number(seatId),
        userId: Number(hold.userId),
        updatedAt: hold.updatedAt,
    }));
    return { showtimeId: Number(showtimeId), holds };
};

const emitHeldSeats = (io, showtimeId) => {
    if (!io) return;
    io.to(getShowtimeRoom(showtimeId)).emit("booking:held-seats", buildHeldSeatsPayload(showtimeId));
};

const clearSocketSelectionForShowtime = (io, socketId, showtimeId) => {
    const socketMap = socketSelections.get(socketId);
    const selectedSeatSet = socketMap?.get(Number(showtimeId));
    if (!selectedSeatSet || !selectedSeatSet.size) return;

    const holdMap = getSeatHoldMap(showtimeId);
    for (const seatId of selectedSeatSet) {
        const hold = holdMap.get(seatId);
        if (hold && hold.socketId === socketId) {
            holdMap.delete(seatId);
        }
    }

    socketMap.delete(Number(showtimeId));
    if (!socketMap.size) socketSelections.delete(socketId);
    emitHeldSeats(io, showtimeId);
};

const syncSocketSelection = (io, socket, normalizedUserId, showtimeId, seatIds) => {
    const normalizedShowtimeId = Number(showtimeId);
    if (!Number.isInteger(normalizedShowtimeId) || normalizedShowtimeId <= 0) return;

    const normalizedSeatIds = normalizeSeatIds(seatIds);
    const nextSeatSet = new Set(normalizedSeatIds);
    const socketMap = getSocketSelectionMap(socket.id);
    const prevSeatSet = socketMap.get(normalizedShowtimeId) || new Set();
    const holdMap = getSeatHoldMap(normalizedShowtimeId);
    const now = Date.now();

    // release deselected seats
    for (const seatId of prevSeatSet) {
        if (!nextSeatSet.has(seatId)) {
            const hold = holdMap.get(seatId);
            if (hold && hold.socketId === socket.id) {
                holdMap.delete(seatId);
            }
        }
    }

    // claim selected seats if free or already owned by this socket
    for (const seatId of nextSeatSet) {
        const existing = holdMap.get(seatId);
        if (!existing || existing.socketId === socket.id) {
            holdMap.set(seatId, {
                userId: Number(normalizedUserId),
                socketId: socket.id,
                updatedAt: now,
            });
        }
    }

    socketMap.set(normalizedShowtimeId, nextSeatSet);
    emitHeldSeats(io, normalizedShowtimeId);
};

const removeBookedOrReleasedHolds = (showtimeId, seatIds) => {
    const holdMap = getSeatHoldMap(showtimeId);
    if (!holdMap?.size) return;
    const normalizedSeatIds = normalizeSeatIds(seatIds);
    if (!normalizedSeatIds.length) return;

    for (const seatId of normalizedSeatIds) {
        holdMap.delete(seatId);
    }

    for (const [, socketMap] of socketSelections.entries()) {
        const selectedSeatSet = socketMap.get(Number(showtimeId));
        if (!selectedSeatSet) continue;
        for (const seatId of normalizedSeatIds) selectedSeatSet.delete(seatId);
    }
};
=======
export const seatLocks = new Map(); 
>>>>>>> 8508776087336c0f8584857c7a9e5eb4e1d5f01a

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
        // chat socket start
        console.log("New socket connected:", socket.id);

        const userId = socket.handshake.query.userId;
        if (!userId) {
            console.log("Connection rejected: No userId");
            return socket.disconnect();
        }

        const normalizedUserId = String(userId);
        console.log("Connected userId:", normalizedUserId);
        onlineUsers.set(normalizedUserId, socket.id);
        // chat socket end

        // showtime socket start
        socket.on("join-hall", ({ hallId, showtimeId }) => {
            socket.join(`hall-${hallId}-showtime-${showtimeId}`);
            socket.hallId = hallId;
            socket.showtimeId = showtimeId;
        });

        socket.on("seat-select", async ({ seatId }) => {
            const key = `${socket.showtimeId}-${seatId}`;
            // 1️⃣ check temporary locks
            if (seatLocks.has(key)) return socket.emit("seat-lock-failed", { seatId });
            seatLocks.set(key, { userId: normalizedUserId, socketId: socket.id, expiresAt: Date.now() + 2 * 60 * 1000 });
            io.to(`hall-${socket.hallId}-showtime-${socket.showtimeId}`).emit("seat-locked", { seatId });
        });

        socket.on("seat-release", ({ seatId }) => {
            const key = `${socket.showtimeId}-${seatId}`;
            if (seatLocks.has(key) && seatLocks.get(key).socketId === socket.id) {
                seatLocks.delete(key);
                io.to(`hall-${socket.hallId}-showtime-${socket.showtimeId}`).emit("seat-unlocked", { seatId });
            }
        });

        socket.on("booking:join-showtime", (payload = {}) => {
            const showtimeId = Number(payload.showtimeId);
            if (!Number.isInteger(showtimeId) || showtimeId <= 0) return;
            socket.join(getShowtimeRoom(showtimeId));
            socket.emit("booking:held-seats", buildHeldSeatsPayload(showtimeId));
        });

        socket.on("booking:leave-showtime", (payload = {}) => {
            const showtimeId = Number(payload.showtimeId);
            if (!Number.isInteger(showtimeId) || showtimeId <= 0) return;
            clearSocketSelectionForShowtime(io, socket.id, showtimeId);
            socket.leave(getShowtimeRoom(showtimeId));
        });

        socket.on("booking:selection-sync", (payload = {}) => {
            const showtimeId = Number(payload.showtimeId);
            if (!Number.isInteger(showtimeId) || showtimeId <= 0) return;
            syncSocketSelection(io, socket, normalizedUserId, showtimeId, payload.selectedSeatIds || []);
        });

        socket.on("disconnect", () => {
            onlineUsers.delete(normalizedUserId);
<<<<<<< HEAD

            const socketMap = socketSelections.get(socket.id);
            if (socketMap) {
                for (const showtimeId of socketMap.keys()) {
                    clearSocketSelectionForShowtime(io, socket.id, showtimeId);
                }
            }
            socketSelections.delete(socket.id);
=======
            for (let [key, value] of seatLocks.entries()) {
                if (value.socketId === socket.id) {
                    seatLocks.delete(key);
                    const [showtimeId, seatId] = key.split("-");
                    io.to(`hall-${socket.hallId}-showtime-${showtimeId}`).emit("seat-unlocked", { seatId });
                }
            }
>>>>>>> 8508776087336c0f8584857c7a9e5eb4e1d5f01a
        });
    });
};

export const getReceiverSocketId = (userId) => onlineUsers.get(String(userId));

export const emitShowtimeSeatUpdate = (io, { showtimeId, action, seatIds = [], bookingId, userId }) => {
    if (!io) return;
    const normalizedShowtimeId = Number(showtimeId);
    if (!Number.isInteger(normalizedShowtimeId) || normalizedShowtimeId <= 0) return;

    const normalizedSeatIds = normalizeSeatIds(seatIds);
    removeBookedOrReleasedHolds(normalizedShowtimeId, normalizedSeatIds);

    io.to(getShowtimeRoom(normalizedShowtimeId)).emit("booking:seats-updated", {
        showtimeId: normalizedShowtimeId,
        action,
        seatIds: normalizedSeatIds,
        bookingId: Number.isInteger(Number(bookingId)) ? Number(bookingId) : null,
        userId: Number.isInteger(Number(userId)) ? Number(userId) : null,
        at: new Date().toISOString(),
    });

    emitHeldSeats(io, normalizedShowtimeId);
};
