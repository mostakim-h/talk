import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLogin } from "../hooks/authHooks"
import { useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {Loader2, Mail, Lock, Eye, EyeOff, AlertCircleIcon} from "lucide-react"
import type {IUser} from "@/types/IUser.ts";
import type {AxiosError} from "axios";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface AuthState {
  auth: {
    user: IUser
  }
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const user = useSelector((state: AuthState) => state.auth.user)
  const { mutateAsync: login, isPending, error } = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "iamlearner.forme@gmail.com",
      password: "555555",
    },
  })

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login(values)
    } catch (err) {
      const axiosError = err as AxiosError
      if (axiosError.response) {
        console.error("Login failed:", axiosError.response.data)
      } else {
        console.error("Login failed:", axiosError.message)
      }
    }
  }

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-slate-600">Enter your credentials to access your account</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircleIcon/>
                  <AlertDescription>{error?.response?.data?.message}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          disabled={isPending}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          disabled={isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isPending}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <p
                  className="p-0 text-sm text-slate-600 m-0 cursor-pointer select-none"
                  aria-disabled={isPending}
                  onClick={() => navigate("/forget-password")}
                >
                  Forgot password?
                </p>
              </div>


              <Button type="submit" className="w-full" variant={'outline'} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">

          <div className="relative w-full">
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-slate-500">Don't have an account?</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => navigate("/register")}
            disabled={isPending}
          >
            Create account
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
