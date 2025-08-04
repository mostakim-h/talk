import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import {useAppSelector} from "@/redux/hooks.ts";
import {Edit3, LogOut} from "lucide-react";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useLogOut} from "@/features/auth/hooks/authHooks.ts";
import {useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {useUpdateUserProfile} from "@/features/chat/hooks/userHooks.ts";

export default function EditProfile() {
  const user = useAppSelector((state) => state.auth.user);
  const {mutateAsync: logOut, isPending} = useLogOut()
  const {mutateAsync: update} = useUpdateUserProfile()
  const [editMode, setEditMode] = useState<string>('');

  const handleEdit = (field: string) => {
    setEditMode(field);
  };

  const handleUpdate = async (field: string, value: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (user[field] === value) return
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await update({userId: user?._id, bodyData: {[field]: value}});
      setEditMode('');
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

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
          {editMode === "name" ? (
            <Input
              type="text"
              defaultValue={user?.fullName || "John Doe"}
              className="w-full"
              autoFocus={true}
              onBlur={(e) => {
                handleUpdate('fullName', e.target.value);
                setEditMode('');
              }}
            />
          ) : (
            <>
              <h3 className="font-semibold m-0 text-2xl">{user?.fullName}</h3>
              <Button
                disabled={isPending}
                variant="ghost" size="icon" className="w-8 h-8 rounded-lg"
                onClick={() => handleEdit('name')}
              >
                <Edit3 size={10}/>
              </Button>
            </>
          )}

        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>About</span>
          <div className={'flex items-center justify-between'}>
            {editMode === "about" ? (
              <Input
                type="text"
                defaultValue={user?.about || "Full-Stack Engineer (MERN)"}
                className="w-full"
                autoFocus={true}
                onBlur={(e) => {
                  handleUpdate('about', e.target.value);
                  setEditMode('');
                }}
              />
            ) : (
              <>
                <p className={'text-sm'}>{user?.about || "Full-Stack Engineer (MERN)"}</p>
                <Button
                  disabled={isPending}
                  variant="ghost" size="icon" className="w-8 h-8 rounded-lg"
                  onClick={() => handleEdit('about')}
                >
                  <Edit3 size={10}/>
                </Button>
              </>
            )}
          </div>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Email</span>
          <p className={'text-sm'}>{user?.email}</p>
        </div>
      </div>

      <Separator className="my-3"/>

      {/*  log out*/}
      <div className={'flex justify-center'}>
        <Button
          disabled={isPending}
          onClick={() => logOut()}
          variant="ghost" className="h-8">
          <div className={'flex items-center gap-2'}>
            <LogOut />
            <span>Log out</span>
          </div>
        </Button>
      </div>
    </div>
  );
}