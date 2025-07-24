import {useLogOut, useSendEmailToResetPassword, useSendEmailToVerifyUserEmail} from "../../auth/hooks/authHooks.js";
import {useSelector} from "react-redux";
import Chat from "../components/singleChat/Chat.jsx";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const {mutateAsync: logOut, isPending: progressLogOut} = useLogOut()
  const {mutateAsync: sendEmailToVerifyUserEmail, isPending: progressEmail} = useSendEmailToVerifyUserEmail()
  const {mutateAsync: sendEmailToResetPassword, isPending: progressPass} = useSendEmailToResetPassword()

  const handleSendVerificationEmail = async () => {
    await sendEmailToVerifyUserEmail(user.email);
  }

  const handleResetPassword = async () => {
    await sendEmailToResetPassword(user.email);
  }

  return (
    <div>

      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user.fullName}!</p>
        <p>Email: {user.email}</p>
        <p>Id: {user._id}</p>
        <button onClick={logOut} disabled={progressLogOut}>Log Out</button>
        <button onClick={handleSendVerificationEmail} disabled={progressEmail}>Send Verification Email</button>
        <button onClick={handleResetPassword} disabled={progressPass}>Reset Password</button>
      </div>


      <Chat/>

    </div>
  )
}