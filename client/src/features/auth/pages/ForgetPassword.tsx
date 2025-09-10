import * as React from "react";
import {useState} from "react";
import {Link} from "react-router-dom";
import {useSendEmailToResetPassword} from "../hooks/authHooks.ts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Label} from "@radix-ui/react-label";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, Loader2, Mail} from "lucide-react";

export default function ForgetPassword() {
  const {mutateAsync: sendEmailToResetPassword, isPending, error} = useSendEmailToResetPassword()
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await sendEmailToResetPassword(form.email);
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Login failed. Please try again.');
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent a password reset link to {form.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setSuccess(false)}>
              Try Different Email
            </Button>
            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary"/>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error?.response?.data?.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                disabled={isPending}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full" disabled={isPending || !form.email}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2"/>
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="flex flex-col space-y-2 text-center text-sm">
              <Link to="/login" className="hover:underline text-muted-foreground">
                Remember your password? Sign in
              </Link>
              <Link to="/register" className="hover:underline text-muted-foreground">
                Don't have an account? Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )

}