"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import api from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    setServerError("")
    try {
      await api.register(data)
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      setServerError(err.message || "Registration failed. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold">Account created!</h2>
          <p className="text-muted-foreground">Redirecting you to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Finflow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Start your journey to<br />
            <span className="text-primary">financial freedom</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Join thousands of users taking control of their finances with AI-powered insights.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {[
            "Auto-categorise your expenses",
            "Get AI-powered spending insights",
            "Track habits and build streaks",
            "Manage tax deductions effortlessly",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Finflow</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-muted-foreground mt-1">Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" placeholder="Arjun" {...register("first_name")} />
                {errors.first_name && (
                  <p className="text-xs text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" placeholder="Kumar" {...register("last_name")} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="arjun_kumar"
                autoComplete="username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="arjun@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password2">Confirm password</Label>
              <div className="relative">
                <Input
                  id="password2"
                  type={showPassword2 ? "text" : "password"}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="pr-10"
                  {...register("password2")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password2 && (
                <p className="text-xs text-destructive">{errors.password2.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account...</>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
