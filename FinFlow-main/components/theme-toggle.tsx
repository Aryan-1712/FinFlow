"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    if (newTheme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", systemDark)
    } else {
      root.classList.toggle("dark", newTheme === "dark")
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => applyTheme("system")
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
      </div>
    )
  }

  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleThemeChange(option.value)}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
            theme === option.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary-foreground/10"
          )}
          aria-label={option.label}
          title={option.label}
        >
          <option.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}
