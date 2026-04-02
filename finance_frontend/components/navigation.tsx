"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Calculator,
  TrendingUp,
  Target,
  Menu,
  X,
  Sparkles,
  LogOut,
  UserCircle,
} from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/",              label: "Dashboard",    icon: LayoutDashboard },
  { href: "/expenses",      label: "Expenses",     icon: Receipt         },
  { href: "/subscriptions", label: "Subscriptions",icon: CreditCard      },
  { href: "/tax",           label: "Tax Assistant",icon: Calculator      },
  { href: "/insights",      label: "Insights",     icon: TrendingUp      },
  { href: "/habits",        label: "Habits",       icon: Target          },
]

function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
      user.username[0].toUpperCase()
    : "?"

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors w-full text-left">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserCircle className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:border-r lg:border-border lg:bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Finflow</span>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</span>
            <ThemeToggle />
          </div>
          <UserMenu />
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Finflow</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed top-16 left-0 right-0 z-50 bg-card border-b border-border transform transition-transform duration-300 ease-out",
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full pointer-events-none"
        )}
      >
        <nav className="px-4 py-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li className="border-t border-border mt-2 pt-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <UserCircle className="w-5 h-5" />
                Profile & Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
