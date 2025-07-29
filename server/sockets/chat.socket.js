const users = {};

module.exports = function(io) {
  io.on('connection', (socket) => {

    // join event to register user and broadcasting to others
    socket.on("join", (userId) => {
      users[socket.id] = userId;

      // Send all currently online users to the new user
      const onlineUsers = Object.values(users);
      io.emit("online-users", onlineUsers); // ✅ Send full list to everyone

      // Broadcast to others that this user is now online
      socket.broadcast.emit("user-online", userId);
    });

    // join_room event to allow users to join a specific chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // send-message event to handle sending messages in a specific room
    socket.on("send-message", ({ roomId, message }) => {
      io.to(roomId).emit("receive-message", {
        senderId: users[socket.id],
        roomId: roomId,
        message
      });
    })


    // typing event to notify receiver when typing
    socket.on("typing", ({ receiverId }) => {
      socket.broadcast.emit("user-typing", {
        senderId: users[socket.id],
        receiverId
      });

      for (const [socketId, userId] of Object.entries(users)) {
        if (userId === receiverId) {
          io.to(socketId).emit("users-typing", {
            senderId: users[socket.id],
          });
        }
      }
    });

    socket.on("disconnect", () => {
      const userId = users[socket.id];
      delete users[socket.id];
      socket.broadcast.emit("user-offline", userId);
      // Update online users list
      const onlineUsers = Object.values(users);
      io.emit("online-users", onlineUsers);
    });
  });
}