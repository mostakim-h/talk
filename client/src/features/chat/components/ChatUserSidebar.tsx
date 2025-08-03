import {useQuery} from "@tanstack/react-query";
import {getAllUsers} from "@/apis/userApis.ts";
import {Button} from "@/components/ui/button.tsx";
import {LogOut, MoreHorizontal, Plus, Search, Settings} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {shortLastSeen} from "@/lib/utils.ts";
import {ModeToggle} from "@/components/ModeToggle";
import {useLogOut} from "@/features/auth/hooks/authHooks.ts";
import {Input} from "@/components/ui/input.tsx";
import type {IUser} from "@/types/IUser.ts";

export default function ChatUsersSidebar(
  {
    handleSelectUser,
    selectedChatUser,
    onlineUsers = [],
    usersTyping = [],
    userId = "",
  }: {
    handleSelectUser: (user: IUser) => void,
    selectedChatUser: IUser,
    onlineUsers?: string[],
    usersTyping?: string[]
    userId?: string,
  }) {

  const {mutateAsync: logOut, isPending} = useLogOut()

  const {data: users} = useQuery({
    queryKey: ['chatUsers'],
    queryFn: () => getAllUsers(),
  })

  const isUserTyping = (userId: string) => usersTyping.includes(userId);

  return (
    <Card className="w-80 flex flex-col">
      <CardHeader>
        {/* Navigation Icons */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Chat</h1>
          </div>
          <div className="flex gap-3">
            <ModeToggle/>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
              <Settings className="w-4 h-4"/>
            </Button>
            <Button
              disabled={isPending}
              onClick={() => logOut()}
              variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
              <LogOut className="w-4 h-4"/>
            </Button>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
          <Input placeholder="Search" className="pl-10 bg-muted/50 border-0 rounded-xl"/>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Last Chats */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Last chats</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Plus className="w-4 h-4"/>
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <MoreHorizontal className="w-4 h-4"/>
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div
            className="space-y-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {users?.map((user: IUser) => (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleSelectUser(user);
                }}
                key={user._id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedChatUser?._id === user?._id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                }`}
              >
                <div className={'relative'}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {(onlineUsers.includes(user?._id) || user?.isOnline) && (
                    <span
                      className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{user?._id === userId ? "You" : user.fullName}</h4>
                    <span className="text-xs text-muted-foreground">{shortLastSeen(user.updatedAt)}</span>
                  </div>
                  <p
                    className={`text-sm truncate ${isUserTyping(user._id) ? "text-primary italic" : "text-muted-foreground"}`}
                  >
                    {isUserTyping(user._id)
                      ? "Typing..."
                      : user.lastMessage && user.lastMessage.length > 50
                        ? `${user.lastMessage.slice(0, 50)}...`
                        : user.lastMessage && user.lastMessage.length <= 50
                          ? user.lastMessage
                          : "Start a conversation!"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}