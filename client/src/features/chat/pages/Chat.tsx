import {useState} from "react"
import {MoreHorizontal,} from "lucide-react"
import {Button} from "@/components/ui/button.tsx"
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx"
import ChatUsersSidebar from "@/features/chat/components/ChatUserSidebar.tsx";
import {getChatRoomId} from "@/lib/utils.ts";
import socket from "@/config/socket.ts";
import ChatLayout from "@/features/chat/components/ChatLayout.tsx";
import ChatUserDetails from "@/features/chat/components/ChatUserDetails.tsx";
import type {IUser} from "@/types/IUser.ts";
import {useAppSelector} from "@/redux/hooks.ts";
import type {IMessage} from "@/types/message.ts";

export default function ChatDashboard() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const {_id: userId} = useAppSelector((state) => state.auth.user);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const [selectedChatUser, setSelectedChatUser] = useState<IUser>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [messages, setMessages] = useState<IMessage[]>([]);

  const handleSelectUser = (selectedUser: IUser) => {
    setSelectedChatUser(selectedUser);
    const roomId = getChatRoomId(userId, selectedUser?._id);
    setCurrentRoomId(roomId);
    socket.emit('join_room', roomId);
  };

  return (
    <div className="flex h-screen bg-muted p-4 gap-4">
      {/* Left Sidebar - Chat List */}

      <ChatUsersSidebar
        handleSelectUser={handleSelectUser}
        selectedChatUser={selectedChatUser}
        userId={userId}
      />

      {selectedChatUser ? (
        <>
          {/* Middle Column - Chat Panel */}
          <ChatLayout
            selectedChatUser={selectedChatUser}
            currentRoomId={currentRoomId}
            userId={userId}
            messages={messages}
            setMessages={setMessages}
          />

          {/* Right Panel - Shared Files */}
          <ChatUserDetails
            messages={messages}
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
