const {UserModel, ChatModel} = require('../models/index');
const {uploader} = require("../config/cloudinary");

const users = {};
const activeCalls = {};

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

    // ======== WebRTC CALLING EVENTS ========

    // Handle call offer (when someone initiates a call)
    socket.on('call-offer', ({ offer, callType, to, from }) => {
      console.log(`Call offer from ${users[socket.id]} to ${to}, type: ${callType}`);

      // Find the recipient's socket
      const recipientSocketId = Object.keys(users).find(socketId => users[socketId] === to);

      if (recipientSocketId) {
        // Store active call info
        const callId = `${socket.id}-${recipientSocketId}`;
        activeCalls[callId] = {
          caller: socket.id,
          callee: recipientSocketId,
          callType,
          status: 'calling'
        };

        // Send call offer to recipient
        io.to(recipientSocketId).emit('incoming-call', {
          offer,
          callType,
          from: socket.id,
          callerId: users[socket.id],
          callerName: users[socket.id] // You might want to get actual name from database
        });

        console.log(`Call offer sent to ${recipientSocketId}`);
      } else {
        // Recipient not online
        socket.emit('call-failed', {
          reason: 'User is not online',
          to
        });
      }
    });

    // Handle call answer
    socket.on('call-answer', ({ answer, to }) => {
      console.log(`Call answered by ${users[socket.id]} to ${to}`);

      // Find the call
      const callId = Object.keys(activeCalls).find(id =>
        activeCalls[id].caller === to && activeCalls[id].callee === socket.id
      );

      if (callId) {
        activeCalls[callId].status = 'connected';

        // Send answer back to caller
        io.to(to).emit('call-answered', {
          answer,
          from: socket.id
        });

        console.log(`Call answer sent to ${to}`);
      }
    });

    // Handle call rejection
    socket.on('call-rejected', ({ to }) => {
      console.log(`Call rejected by ${users[socket.id]} to ${to}`);

      // Find and remove the call
      const callId = Object.keys(activeCalls).find(id =>
        activeCalls[id].caller === to && activeCalls[id].callee === socket.id
      );

      if (callId) {
        delete activeCalls[callId];

        // Notify caller that call was rejected
        io.to(to).emit('call-rejected', {
          from: socket.id
        });

        console.log(`Call rejection sent to ${to}`);
      }
    });

    // Handle call end
    socket.on('call-ended', () => {
      console.log(`Call ended by ${users[socket.id]}`);

      // Find active calls involving this user
      const userCalls = Object.keys(activeCalls).filter(callId =>
        activeCalls[callId].caller === socket.id || activeCalls[callId].callee === socket.id
      );

      userCalls.forEach(callId => {
        const call = activeCalls[callId];
        const otherParty = call.caller === socket.id ? call.callee : call.caller;

        // Notify the other party that call ended
        io.to(otherParty).emit('call-ended', {
          from: socket.id
        });

        // Remove the call
        delete activeCalls[callId];

        console.log(`Call end notification sent to ${otherParty}`);
      });
    });

    // Handle ICE candidates
    socket.on('ice-candidate', ({ candidate, to }) => {
      console.log(`ICE candidate from ${users[socket.id]} to ${to}`);

      // Find the recipient's socket ID
      const recipientSocketId = typeof to === 'string' && to.length === 20 ? to :
        Object.keys(users).find(socketId => users[socketId] === to);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('ice-candidate', {
          candidate,
          from: socket.id
        });

        console.log(`ICE candidate sent to ${recipientSocketId}`);
      }
    });

    // ======== END WebRTC CALLING EVENTS ========

    socket.on("disconnect", () => {
      const userId = users[socket.id];

      // Handle any active calls when user disconnects
      const userCalls = Object.keys(activeCalls).filter(callId =>
        activeCalls[callId].caller === socket.id || activeCalls[callId].callee === socket.id
      );

      userCalls.forEach(callId => {
        const call = activeCalls[callId];
        const otherParty = call.caller === socket.id ? call.callee : call.caller;

        // Notify the other party that call ended due to disconnect
        io.to(otherParty).emit('call-ended', {
          from: socket.id,
          reason: 'disconnect'
        });

        // Remove the call
        delete activeCalls[callId];
      });

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
};