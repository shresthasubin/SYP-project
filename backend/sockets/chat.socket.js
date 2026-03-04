const onlineUsers = new Map();
export const seatLocks = new Map(); 

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

        socket.on("disconnect", () => {
            onlineUsers.delete(normalizedUserId);
            for (let [key, value] of seatLocks.entries()) {
                if (value.socketId === socket.id) {
                    seatLocks.delete(key);
                    const [showtimeId, seatId] = key.split("-");
                    io.to(`hall-${socket.hallId}-showtime-${showtimeId}`).emit("seat-unlocked", { seatId });
                }
            }
        });
    });
};

export const getReceiverSocketId = (userId) => {
    return onlineUsers.get(String(userId));
};