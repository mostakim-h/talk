import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ChevronRight, File, FileText, ImageIcon, type LucideProps, MoreHorizontal, Video} from "lucide-react";
import type {ForwardRefExoticComponent, RefAttributes} from "react";
import type {IUser} from "@/types/IUser.ts";

interface FileType {
  type: string
  count: number
  size: string
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  color: string
}

const fileTypes: FileType[] = [
  {
    type: "Documents",
    count: 126,
    size: "193MB",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    type: "Photos",
    count: 53,
    size: "321MB",
    icon: ImageIcon,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    type: "Movies",
    count: 3,
    size: "210MB",
    icon: Video,
    color: "bg-teal-50 text-teal-600",
  },
  {
    type: "Other",
    count: 49,
    size: "194MB",
    icon: File,
    color: "bg-red-50 text-red-600",
  },
]

export default function ChatUserDetails({user}: { user: IUser }) {
  return (
    <Card className="w-80 flex flex-col h-full">
      <CardHeader className="text-center pb-4">
        <Avatar className="w-16 h-16 mx-auto mb-3">
          <AvatarImage src={user.avatar || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
          <AvatarFallback className="bg-primary/10 text-primary text-lg">RE</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold mb-1">{user.fullName}</h3>
        <p className="text-sm text-muted-foreground">{user.about || "Full-Stack Engineer (MERN)"}</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <Separator className="mb-6"/>

        {/* File Types */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">File type</h4>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <MoreHorizontal className="w-4 h-4"/>
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-2 pb-2">
              {fileTypes.map((fileType) => (
                <div
                  key={fileType.type}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${fileType.color}`}>
                      <fileType.icon className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="font-medium">{fileType.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {fileType.count} files, {fileType.size}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}