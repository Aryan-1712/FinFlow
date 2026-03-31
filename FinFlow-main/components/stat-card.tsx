"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  trend.value >= 0
                    ? "text-success bg-success/10"
                    : "text-destructive bg-destructive/10"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10",
              iconClassName
            )}
          >
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}
