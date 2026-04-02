"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    setServerError("")
    try {
      await login(data.username, data.password)
    } catch (err: any) {
      setServerError(err.message || "Invalid username or password.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Finflow</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Manage your money<br />
            <span className="text-primary">smarter with AI</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track expenses, analyse subscriptions, and build better financial habits — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Expense Tracking", desc: "Log and categorise every rupee" },
            { label: "AI Insights", desc: "Smart tips from your data" },
            { label: "Habit Builder", desc: "Streaks & financial goals" },
          ].map((f) => (
            <div key={f.label} className="bg-background/50 rounded-xl p-4 border border-border">
              <p className="font-medium text-sm mb-1">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Finflow</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your_username"
                autoComplete="username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
