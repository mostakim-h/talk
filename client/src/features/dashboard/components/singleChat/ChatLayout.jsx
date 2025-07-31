import {useEffect, useState} from "react";
import socket from "../../../../config/socket.js";
import {useQuery} from "@tanstack/react-query";
import {getChats} from "../../../../api/chatApis.js";

const ChatLayout = ({selectedChatUser, currentRoomId, userId}) => {
  const {data} = useQuery({
    queryKey: ['chatMessages', currentRoomId],
    queryFn: ({signal}) => getChats(currentRoomId, signal),
    enabled: !!currentRoomId,
  })

  const [isTyping, setIsTyping] = useState({
    senderId: null,
    isTyping: false,
  });

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  const handleInitMsg = (msgs) => {
    if (msgs && msgs.length > 0) {
      setMessages(msgs);
    } else {
      setMessages([]);
    }
  }

  const sendMessage = () => {
    socket.emit("send-message", {roomId: currentRoomId, message: msg});
    setMsg("");
  };

  useEffect(() => {

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    })

    socket.on("user-typing", (data) => {

      setIsTyping({
        senderId: data.senderId,
        isTyping: true,
      });

      setTimeout(() => {
        setIsTyping({
          receiverId: null,
          isTyping: false,
        });
      }, 2000);
    })

    return () => {
      socket.off("receive-message");
      socket.off("user-typing");
    };
  }, []);

  useEffect(() => {
    if (data) {
      handleInitMsg(data);
    }
  }, [data]);

  return (
    <div>
      <h2>Chat with {selectedChatUser?.fullName || "Select a user"}</h2>
      {isTyping?.isTyping && isTyping?.senderId === selectedChatUser?._id && (
        <p style={{fontStyle: "italic", color: "#888"}}>
          {selectedChatUser.fullName} is typing...
        </p>
      )}
      <div>
        {messages.filter(m => m.roomId === currentRoomId).map((m, i) => (
          <p
            key={i}
            style={{
              textAlign: m.senderId === userId ? "right" : "left",
              backgroundColor: m.senderId === userId ? "#e0f7fa" : "#fff3e0",
              padding: "5px",
              borderRadius: "5px",
              margin: "5px 0",
              maxWidth: "70%",
              marginLeft: m.senderId === userId ? "auto" : "0",
              marginRight: m.senderId === userId ? "0" : "auto",
              wordBreak: "break-word",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              color: m.senderId === userId ? "#000" : "#333",
            }}
          >
            {m.senderId === userId ? (
              <>
                <strong>You:</strong>
                {" "}
                {m.content.message}
              </>
            ) : (
              <>
                <strong>{selectedChatUser?.fullName}:</strong>
                {" "}
                {m.content.message}
              </>
            )}
          </p>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={() => socket.emit("typing", {receiverId: selectedChatUser?._id})}
          placeholder="Type a message..."
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!msg.trim() || !selectedChatUser}
          style={{
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatLayout;
