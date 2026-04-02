"use client"

import { cn } from "@/lib/utils"

interface HealthScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function HealthScore({ score, size = "md", showLabel = true }: HealthScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-primary"
    if (score >= 40) return "text-warning"
    return "text-destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Work"
  }

  const sizeClasses = {
    sm: { container: "w-24 h-24", text: "text-2xl", label: "text-xs" },
    md: { container: "w-36 h-36", text: "text-4xl", label: "text-sm" },
    lg: { container: "w-48 h-48", text: "text-5xl", label: "text-base" },
  }

  const radius = size === "sm" ? 40 : size === "md" ? 60 : 80
  const strokeWidth = size === "sm" ? 6 : size === "md" ? 8 : 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses[size].container)}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-out", getScoreColor(score))}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizeClasses[size].text, getScoreColor(score))}>
            {score}
          </span>
          {showLabel && (
            <span className={cn("text-muted-foreground", sizeClasses[size].label)}>
              {getScoreLabel(score)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
