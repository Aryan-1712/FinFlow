"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import api, { tokenStorage, type User } from "@/services/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.getProfile()
      setUser(profile)
    } catch {
      setUser(null)
      tokenStorage.clear()
    }
  }, [])

  // On mount, check if token exists and fetch user
  useEffect(() => {
    const token = tokenStorage.get()
    if (token) {
      refreshUser().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [refreshUser])

  const login = async (username: string, password: string) => {
    await api.login(username, password)
    const profile = await api.getProfile()
    setUser(profile)
    router.push("/")
  }

  const logout = () => {
    api.logout()
    setUser(null)
    router.push("/login")
  }

  const updateUser = async (data: Partial<User>) => {
    const updated = await api.updateProfile(data)
    setUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
