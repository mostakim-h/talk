import {useQuery} from "@tanstack/react-query";
import {getAllUsers} from "../../../../api/userApis.js";
import {useEffect, useState} from "react";
import socket from "../../../../config/socket.js";

export default function ChatUsersSidebar({handleSelectUser}) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);
  const {data: users} = useQuery({
    queryKey: ['chatUsers'],
    queryFn: getAllUsers,
  })

  useEffect(() => {
    socket.on("online-users", (onlineUsers) => {
      // Store this in your Redux or React state
      setOnlineUsers(onlineUsers);
    });

    socket.on("user-online", (userId) => {
      // Add this userId to online user state
      console.log("User just came online:", userId);
    });

    socket.on("users-typing", (data) => {
      const {senderId} = data;
      setUsersTyping((prev) => {
        if (!prev.includes(senderId)) {
          return [...prev, senderId];
        }
        return prev;
      });
      setTimeout(() => {
        setUsersTyping((prev) => prev.filter(id => id !== senderId));
      }, 2000); // Clear typing status after 2 seconds
    })

    return () => {
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-typing");
    };
  }, []);

  const isUserTyping = (userId) => usersTyping.includes(userId);

  return (
    <div className="chat-users-sidebar">
      <h2>Chat</h2>
      <div>
        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              style={{
                display: 'flex',
                alignItems: 'start',
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #ccc',
                flexDirection: 'column',
              }}
              onClick={() => handleSelectUser(user)}
            >
              <span>{user.fullName}</span>
              <span style={{color: '#888'}}>{user.email}</span>
              <span style={{color: onlineUsers.includes(user._id) ? 'green' : 'red'}}>
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
              </span>
              {isUserTyping(user._id) && <span>typing...</span>}
            </div>
          ))
        ) : (
          <p>No users available</p>
        )}
      </div>
    </div>
  );
}