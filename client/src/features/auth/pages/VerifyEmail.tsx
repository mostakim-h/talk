import {useEffect, useState} from "react";
import {useVerifyUserEmail} from "../hooks/authHooks.ts";

export default function VerifyEmail() {
  const {  mutateAsync: verifyEmail, isPending } = useVerifyUserEmail();
  const [verified, setVerified] = useState(false);

  useEffect(()=>{
    const callToVerifyEmail = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');

      if (token) {
        await verifyEmail(token);
        setVerified(true);
      } else {
        alert("Invalid or missing verification token.");
      }
    }

    callToVerifyEmail();
  }, []);

  return (
    <div>
      <h1>Verify Email</h1>
      <p>Please wait while we verify your email...</p>
      {isPending && <p>Verifying...</p>}
      {verified && <p>Your email has been successfully verified!</p>}
      {!verified && !isPending && <p>Verification failed. Please try again.</p>}
      <p>If you have any issues, please contact support.</p>
    </div>
  );
}