import ChatSidebar from "./ChatSidebar.jsx";
import ChatUsersSidebar from "./ChatUsersSidebar.jsx";
import ChatLayout from "./ChatLayout.jsx";
import ChatUserDetails from "./ChatUserDetails.jsx";
import {useState} from "react";
import {useSelector} from "react-redux";
import socket from "../../../../config/socket.js";
import {getChatRoomId} from "../../../../utils/utils.js";

export default function Chat() {
  const {user: {_id: userId}} = useSelector(state => state.auth);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);

  const handleSelectUser = (selectedUser) => {
    setSelectedChatUser(selectedUser);
    const roomId = getChatRoomId(userId, selectedUser?._id);
    setCurrentRoomId(roomId);
    socket.emit('join_room', roomId);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '100px 250px auto 350px',
        gap: '20px',
      }}
    >
      <ChatSidebar/>
      <ChatUsersSidebar
        handleSelectUser={handleSelectUser}
      />

      {currentRoomId && (
        <ChatLayout
          selectedChatUser={selectedChatUser}
          currentRoomId={currentRoomId}
          userId={userId}
        />
      )}

      <ChatUserDetails
        selectedChatUser={selectedChatUser}
      />
    </div>
  );
}