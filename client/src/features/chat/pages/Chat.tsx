import {useEffect, useState} from "react"
import {MoreHorizontal,} from "lucide-react"
import {Button} from "@/components/ui/button.tsx"
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx"
import ChatUsersSidebar from "@/features/chat/components/ChatUserSidebar.tsx";
import {useSelector} from "react-redux";
import {getChatRoomId} from "@/lib/utils.ts";
import socket from "@/config/socket.ts";
import ChatLayout from "@/features/chat/components/ChatLayout.tsx";
import ChatUserDetails from "@/features/chat/components/ChatUserDetails.tsx";

export default function ChatDashboard() {
  const {user: {_id: userId}} = useSelector((state: any) => state.auth);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');

  const handleSelectUser = (selectedUser: any) => {
    setSelectedChatUser(selectedUser);
    const roomId = getChatRoomId(userId, selectedUser?._id);
    setCurrentRoomId(roomId);
    socket.emit('join_room', roomId);
  };

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);

  useEffect(() => {
    socket.on("online-users", (onlineUsers: []) => {
      console.log("Online users:", onlineUsers);
      setOnlineUsers(onlineUsers);
    });

   /*socket.on("user-online", (userId: any) => {
      console.log("User just came online:", userId);
    });*/

    socket.on("users-typing", (data: any) => {
      const {senderId} = data;
      setUsersTyping((prev: any) => {
        if (!prev.includes(senderId)) {
          return [...prev, senderId];
        }
        return prev;
      });
      setTimeout(() => {
        setUsersTyping((prev) => prev.filter(id => id !== senderId));
      }, 2000);
    })

    return () => {
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-typing");
    };
  }, []);

  return (
    <div className="flex h-screen bg-muted p-4 gap-4">
      {/* Left Sidebar - Chat List */}

      <ChatUsersSidebar
        handleSelectUser={handleSelectUser}
        selectedChatUser={selectedChatUser}
        onlineUsers={onlineUsers}
        usersTyping={usersTyping}
        userId={userId}
      />

      {selectedChatUser ? (
        <>
          {/* Middle Column - Chat Panel */}
          <ChatLayout
            selectedChatUser={selectedChatUser}
            currentRoomId={currentRoomId}
            userId={userId}
          />

          {/* Right Panel - Shared Files */}
          <ChatUserDetails
            user={selectedChatUser}
          />
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Welcome to Chat</h2>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
                <MoreHorizontal className="w-4 h-4"/>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <p>Select a user to start chatting</p>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
