"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Sparkles } from "lucide-react"

const PUBLIC_ROUTES = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    if (!isAuthenticated && !isPublic) {
      router.replace("/login")
    }
    if (isAuthenticated && isPublic) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Full-screen loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading Finflow...</p>
        </div>
      </div>
    )
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  // Don't render protected content while redirecting
  if (!isAuthenticated && !isPublic) return null
  if (isAuthenticated && isPublic) return null

  return <>{children}</>
}
