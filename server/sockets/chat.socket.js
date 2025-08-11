const {UserModel, ChatModel} = require('../models/index');
const {uploader} = require("../config/cloudinary");

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

      UserModel.findByIdAndUpdate(userId, { isOnline: true }, { new: true }).then(user => {
        console.log("User is online:", user);
      })
    });

    // join_room event to allow users to join a specific chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    // send-message event to handle sending messages in a specific room
    socket.on("send-message", async ({ roomId, message, media, type }) => {
      let uploadedUrls = [];

      console.log({roomId, message, media, type})

      if (media && media.length > 0) {
        for (let base64File of media) {
          try {
            let uploadOptions = {
              folder: "chat_media",
              resource_type: 'auto',
            };

            base64File = base64File?.replace(/;codecs=[^;]+/g, '');
            if (type === 'voice') {
              uploadOptions = {
                folder: "chat_media",
                resource_type: 'video',
                format: 'mp3'
              };
            }

            const result = await uploader.upload(base64File, uploadOptions);
            uploadedUrls.push(result.secure_url);

          } catch (err) {
            console.error("Cloudinary upload error:", err);
            console.error("Base64 prefix:", base64File.substring(0, 100));

            // Fallback: try uploading as raw file
            if (type === 'voice') {
              try {
                const fallbackResult = await uploader.upload(base64File, {
                  folder: "chat_media",
                  resource_type: 'raw',
                });
                uploadedUrls.push(fallbackResult.secure_url);
                console.log("Fallback upload successful");
              } catch (fallbackErr) {
                console.error("Fallback upload also failed:", fallbackErr);
              }
            }
          }
        }
      }

      const messageData = {
        senderId: users[socket.id],
        roomId: roomId,
        content: {
          message: message,
          media: uploadedUrls,
        },
        type: type || 'text',
        reactions: [],
        createdAt: new Date(),
        _id: new Date().getTime().toString(),
      };

      // Emit to room first for real-time experience
      io.to(roomId).emit("receive-message", messageData);

      // Save to database
      ChatModel.create({
        roomId: roomId,
        senderId: users[socket.id],
        content: {
          message: message,
          media: uploadedUrls
        },
        type: type || 'text',
        reactions: []
      }).then(() => {
        console.log("Message saved to database");
      }).catch((err) => {
        console.error("Error saving message:", err);
      })
    });

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
      UserModel.findByIdAndUpdate(userId, { isOnline: false }, { new: true }).then((user) => {
        console.log("User is offline:", user);
      })
      // Update online users list
      const onlineUsers = Object.values(users);
      io.emit("online-users", onlineUsers);
    });
  });
}