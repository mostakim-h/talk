import {Button} from "@/components/ui/button.tsx";
import {useLogOut} from "@/features/auth/hooks/authHooks.ts";

export default function ChatSidebar() {
  const {mutateAsync: logOut, isPending: progressLogOut} = useLogOut()

  return (
    <div className="p-3 border-end bg-red">
      <h2 className={'text-bolder'}>Chat</h2>
      {/* Add sidebar content here, such as chat rooms or contacts */}
      <Button onClick={() => logOut()} disabled={progressLogOut}>Log Out</Button>

    </div>
  );
}