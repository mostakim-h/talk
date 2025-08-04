import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {useAppSelector} from "@/redux/hooks.ts";
import {Edit3, LogOut} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useLogOut} from "@/features/auth/hooks/authHooks.ts";

export default function EditProfile() {
  const user = useAppSelector((state) => state.auth.user);
  const {mutateAsync: logOut, isPending} = useLogOut()

  return (
    <div>
      <Avatar className="w-15 h-15">
        <AvatarImage src={user?.avatar || "https://avatars.githubusercontent.com/u/124599?v=4"}/>
        <AvatarFallback className="bg-primary/10 text-primary">
          {user?.fullName
            .split(" ")
            .map((n: string) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className={'pt-2 space-y-2'}>
        <div className={'flex items-center justify-between mb-2'}>
          <h3 className="font-semibold m-0 text-2xl">{user?.fullName}</h3>
          <Edit3 size={15}/>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>About</span>
          <p className={'text-sm'}>{user?.about || "Full-Stack Engineer (MERN)"}</p>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Email</span>
          <p className={'text-sm'}>{user?.email}</p>
        </div>
      </div>

      <Separator className="my-3"/>

      {/*  log out*/}
      <Button
        disabled={isPending}
        onClick={() => logOut()}
        variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
        <LogOut className="w-4 h-4"/>
      </Button>
    </div>
  );
}