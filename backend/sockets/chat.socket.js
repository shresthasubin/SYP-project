const onlineUsers = new Map();

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("New socket connected:", socket.id);

        const userId = socket.handshake.query.userId;

        if (!userId) {
            console.log("Connection rejected: No userId");
            return socket.disconnect();
        }

        const normalizedUserId = String(userId);
        console.log("Connected userId:", normalizedUserId);

        onlineUsers.set(normalizedUserId, socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected:", normalizedUserId);
            onlineUsers.delete(normalizedUserId);
        });
    });
};

export const getReceiverSocketId = (userId) => {
    return onlineUsers.get(String(userId));
};