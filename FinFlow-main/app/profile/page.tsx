"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/auth-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/services/api"
import {
  User,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  AtSign,
  Calendar,
} from "lucide-react"

// ── Profile form schema ────────────────────────────────────────────────────────
const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
})
type ProfileForm = z.infer<typeof profileSchema>

// ── Password form schema ───────────────────────────────────────────────────────
const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
type PasswordForm = z.infer<typeof passwordSchema>

// ── Status banner ──────────────────────────────────────────────────────────────
function StatusBanner({ type, message }: { type: "success" | "error"; message: string }) {
  const isSuccess = type === "success"
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${
        isSuccess
          ? "bg-success/10 border-success/20 text-success"
          : "bg-destructive/10 border-destructive/20 text-destructive"
      }`}
    >
      {isSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
    </div>
  )
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Profile form
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      email: user?.email ?? "",
      username: user?.username ?? "",
    },
  })

  // Password form
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileStatus(null)
    try {
      await updateUser(data)
      setProfileStatus({ type: "success", message: "Profile updated successfully." })
    } catch (err: any) {
      setProfileStatus({ type: "error", message: err.message || "Failed to update profile." })
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordStatus(null)
    try {
      await api.changePassword(data.old_password, data.new_password)
      setPasswordStatus({ type: "success", message: "Password changed successfully." })
      resetPassword()
    } catch (err: any) {
      setPasswordStatus({ type: "error", message: err.message || "Failed to change password." })
    }
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || user.username[0].toUpperCase()
    : "?"

  const joinDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : ""

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your account settings</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="text-destructive border-destructive/30 hover:bg-destructive/10 w-fit">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>

          {/* Avatar card */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <AtSign className="w-3.5 h-3.5" />{user?.username}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />{user?.email}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3" />Member since {joinDate}
              </p>
            </div>
          </div>

          {/* Edit profile */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Personal Information</h2>
            </div>

            <form onSubmit={handleProfile(onProfileSubmit)} className="flex flex-col gap-4">
              {profileStatus && <StatusBanner type={profileStatus.type} message={profileStatus.message} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="first_name">First name</Label>
                  <Input id="first_name" {...regProfile("first_name")} />
                  {profileErrors.first_name && (
                    <p className="text-xs text-destructive">{profileErrors.first_name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input id="last_name" {...regProfile("last_name")} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...regProfile("username")} />
                {profileErrors.username && (
                  <p className="text-xs text-destructive">{profileErrors.username.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" {...regProfile("email")} />
                {profileErrors.email && (
                  <p className="text-xs text-destructive">{profileErrors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-fit" disabled={profileSubmitting}>
                {profileSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Save changes</>
                )}
              </Button>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Change Password</h2>
            </div>

            <form onSubmit={handlePassword(onPasswordSubmit)} className="flex flex-col gap-4">
              {passwordStatus && <StatusBanner type={passwordStatus.type} message={passwordStatus.message} />}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="old_password">Current password</Label>
                <Input id="old_password" type="password" placeholder="••••••••" {...regPassword("old_password")} />
                {passwordErrors.old_password && (
                  <p className="text-xs text-destructive">{passwordErrors.old_password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new_password">New password</Label>
                <Input id="new_password" type="password" placeholder="Min. 8 characters" {...regPassword("new_password")} />
                {passwordErrors.new_password && (
                  <p className="text-xs text-destructive">{passwordErrors.new_password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm_password">Confirm new password</Label>
                <Input id="confirm_password" type="password" placeholder="Repeat new password" {...regPassword("confirm_password")} />
                {passwordErrors.confirm_password && (
                  <p className="text-xs text-destructive">{passwordErrors.confirm_password.message}</p>
                )}
              </div>

              <Button type="submit" variant="outline" className="w-fit" disabled={passwordSubmitting}>
                {passwordSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" />Update password</>
                )}
              </Button>
            </form>
          </div>

        </div>
      </main>
    </div>
  )
}
