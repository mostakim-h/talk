import {useLogOut, useSendEmailToResetPassword, useSendEmailToVerifyUserEmail} from "../../auth/hooks/authHooks.js";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {useAppSelector} from "@/redux/hooks.ts";

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const {mutateAsync: logOut, isPending: progressLogOut} = useLogOut()
  const {mutateAsync: sendEmailToVerifyUserEmail, isPending: progressEmail} = useSendEmailToVerifyUserEmail()
  const {mutateAsync: sendEmailToResetPassword, isPending: progressPass} = useSendEmailToResetPassword()

  const navigate = useNavigate()

  const handleSendVerificationEmail = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await sendEmailToVerifyUserEmail(user.email);
  }

  const handleResetPassword = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await sendEmailToResetPassword(user.email);
  }

  return (
    <div>
      <div>
        <h1>Dashboard</h1>
        <Button onClick={() => logOut()} disabled={progressLogOut}>Log Out</Button>
        <Button onClick={handleSendVerificationEmail} disabled={progressEmail}>Send Verification Email</Button>
        <Button onClick={handleResetPassword} disabled={progressPass}>Reset Password</Button>
        <Button onClick={() => navigate('/chat')} disabled={progressPass}>Start Chatting</Button>
      </div>

    </div>
  )
}