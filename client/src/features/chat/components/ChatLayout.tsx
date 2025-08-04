import {useEffect, useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import socket from "@/config/socket.ts";
import {getChats} from "@/apis/chatApis.ts";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Paperclip, Phone, Search, Send, Smile, VideoIcon} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {shortLastSeen} from "@/lib/utils.ts";
import type {IUser} from "@/types/IUser.ts";
import type {IMessage} from "@/types/message.ts";

const ChatLayout = ({selectedChatUser, currentRoomId, userId}: {
  selectedChatUser: IUser,
  currentRoomId: string,
  userId: string
}) => {
  const {data} = useQuery({
    queryKey: ['chatMessages', currentRoomId],
    queryFn: ({signal}) => getChats(currentRoomId, signal),
    enabled: !!currentRoomId,
  })

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [isTyping, setIsTyping] = useState({
    senderId: null as string | null,
    isTyping: false,
  });

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const handleInitMsg = (messages: IMessage[]) => {
    if (messages && messages.length > 0) {
      setMessages(messages);
    } else {
      setMessages([]);
    }
  }

  const sendMessage = () => {
    socket.emit("send-message", {roomId: currentRoomId, message: msg});
    setMsg("");
  };

  useEffect(() => {

    socket.on("receive-message", (data: IMessage) => {
      setMessages((prev: IMessage[]) => [...prev, data]);
    })

    socket.on("user-typing", (data: { senderId: string }) => {

      setIsTyping({
        senderId: data.senderId,
        isTyping: true,
      });

      setTimeout(() => {
        setIsTyping({
          senderId: null,
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


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
  }, [messages])

  return (
    <Card className="flex-1 flex flex-col h-full pt-2 gap-0">
      <CardHeader className="px-2 py-0">
        <div className="bg-muted/90 flex items-center justify-between gap-4 px-4 py-2 rounded-lg">
          {/* Avatar and User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={selectedChatUser?.avatar || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
              <AvatarFallback>
                {selectedChatUser?.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="m-0 font-medium">
                {selectedChatUser?.fullName || "Select a user"}
              </h2>
              <p
                className={`text-xs ${
                  selectedChatUser?.isOnline
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                {selectedChatUser?.isOnline
                  ? "Online"
                  : selectedChatUser && shortLastSeen(selectedChatUser?.updatedAt)}
              </p>
            </div>
          </div>

          {/* Buttons */}

          <div
            className="flex gap-5 items-center">
            <div
              className="bg-white/80 dark:bg-muted/50 p-3 px-4 rounded-md transition-colors cursor-pointer flex gap-5 items-center">
              <VideoIcon className=" w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"/>
              <Phone className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"/>
            </div>

            <Search className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"/>
          </div>

        </div>
      </CardHeader>


      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="space-y-4">
            {messages && messages.length !== 0 ? (
              messages.map((message) => (
                <div key={message._id} className={`flex gap-3 ${message.senderId === userId ? "justify-end" : ""}`}>
                  {message.senderId !== userId && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={'https://avatars.githubusercontent.com/u/124599?v=4'}/>
                      <AvatarFallback>
                        {selectedChatUser?.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-md ${message.senderId === userId ? "order-first" : ""}`}>
                    {message.senderId !== userId && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{shortLastSeen(message.createdAt)}</span>
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl ${
                        message.senderId === userId
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.content.message}</p>
                    </div>
                    {message.senderId === userId && (
                      <div className="text-right mt-1">
                        <span className="text-xs text-muted-foreground">{shortLastSeen(message.createdAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}

            {/* Typing Indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
              {isTyping?.isTyping && isTyping?.senderId === selectedChatUser?._id && (
                <div className="flex gap-1">
                  <div
                    className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce"/>
                  <div
                    className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce"
                    style={{animationDelay: "0.1s"}}/>
                  <div
                    className="w-1 h-1 bg-muted-foreground/60 rounded-full animate-bounce"
                    style={{animationDelay: "0.2s"}}
                  />
                </div>
              )}
            </div>

            <div ref={messagesEndRef}/>
          </div>
        </ScrollArea>

        <Separator className="my-4"/>

        {/* Message Input */}
        <div className="flex items-end gap-3 p-3 bg-muted/50 rounded-xl">
          <Textarea
            placeholder="Write your message..."
            value={msg}
            onKeyDown={() => socket.emit("typing", {receiverId: selectedChatUser?._id})}
            onChange={(e) => setMsg(e.target.value)}
            className="flex-1 min-h-[40px] max-h-32 bg-transparent border-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground"
            rows={1}
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <Smile className="w-4 h-4"/>
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <Paperclip className="w-4 h-4"/>
            </Button>
            <Button
              size="icon"
              className="w-8 h-8 rounded-lg"
              disabled={!msg.trim() || !selectedChatUser}
              onClick={sendMessage}
            >
              <Send className="w-4 h-4"/>
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default ChatLayout;