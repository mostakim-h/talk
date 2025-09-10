import {useEffect, useState} from "react";
import {useVerifyUserEmail} from "../hooks/authHooks.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {CheckCircle, Loader2, Mail, XCircle} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">Verify Email</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Please wait while we verify your email address
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isPending && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="ml-2">Verifying your email address...</AlertDescription>
            </Alert>
          )}

          {!isPending && verified && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="ml-2 text-green-800 dark:text-green-200">
                Your email has been successfully verified!
              </AlertDescription>
            </Alert>
          )}

          {!isPending && !verified && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="ml-2 text-red-800 dark:text-red-200">
                  Verification failed. Please try again.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setVerified(false);
                    await verifyEmail();
                  }}
                >
                  Retry Verification
                </Button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              If you continue to have issues, please{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                contact support
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}