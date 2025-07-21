import {
  useLogOut,
  useSendEmailToResetPassword,
  useSendEmailToVerifyUserEmail
} from "../../auth/hooks/authHooks.js";
import {useSelector} from "react-redux";

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
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>

      <button
        onClick={logOut}
        disabled={progressLogOut}
      >
        Log out
      </button>

      <div>
        <h2>User Information</h2>
        {user ? (
          <div>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Varification status:</strong> {user.isVerified ? "Varified" : <>Not Varified <button disabled={progressEmail}
              onClick={handleSendVerificationEmail}>Click to verify</button></>}</p>
            <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
            <p><strong>Reset your password:</strong>
              <button disabled={progressPass} onClick={handleResetPassword}>Reset password</button>
            </p>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}

      </div>

    </div>
  )
}