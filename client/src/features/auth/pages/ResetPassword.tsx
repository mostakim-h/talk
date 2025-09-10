import {useState} from "react";
import {useResetPassword} from "../hooks/authHooks.ts";
import * as React from "react";
import {Card} from "@/components/ui/card.tsx";
import {CardContent} from "@/components/ui/card.tsx";
import {CardDescription} from "@/components/ui/card.tsx";
import {CardHeader} from "@/components/ui/card.tsx";
import {CardTitle} from "@/components/ui/card.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {AlertCircle} from "lucide-react";
import {Lock, Eye, EyeOff} from "lucide-react";
import {useNavigate} from "react-router-dom";

export default function ResetPassword() {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token') || '';
  const {mutateAsync: resetPassword, isPending} = useResetPassword();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword({token, password: formData.password});
      window.location.href = "/login";
    } catch (err: any) {
      alert(err.message || 'Password reset failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Reset Password</CardTitle>
          <CardDescription>Enter your new password below to complete the reset process</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your new password"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Make sure your new password is strong and secure.
              </p>
            </div>

            <Button type="submit" variant={'outline'} className="w-full" disabled={isPending}>
              {isPending ? "Resetting Password..." : "Reset Password"}
            </Button>

            <div>
              <p className="text-sm text-muted-foreground text-center">
                If you did not request a password reset, please ignore this email.
              </p>
            </div>

            <div className={'flex items-center justify-center gap-2'}>
              <Button
                type="button"
                variant="outline"
                className="flex-grow-1 bg-transparent"
                onClick={() => navigate("/login")}
                disabled={isPending}
              >
                Login
              </Button>
              <span className="text-sm text-muted-foreground">Remembered your password?</span>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}