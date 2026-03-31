"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Lightbulb, Trophy, ArrowRight } from "lucide-react"
import type { SpendingInsight } from "@/services/api"

const iconMap = {
  warning: AlertTriangle,
  tip: Lightbulb,
  achievement: Trophy,
}

const colorMap = {
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  tip: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  achievement: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
}

interface InsightCardProps {
  insight: SpendingInsight
  onClick?: () => void
}

export function InsightCard({ insight, onClick }: InsightCardProps) {
  const Icon = iconMap[insight.type]
  const colors = colorMap[insight.type]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border p-4 transition-all duration-300 hover:shadow-md cursor-pointer group",
        colors.border
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
            colors.bg
          )}
        >
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{insight.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {insight.description}
          </p>
          {insight.actionLabel && (
            <button className={cn("flex items-center gap-1 text-xs font-medium mt-2 transition-colors", colors.text)}>
              {insight.actionLabel}
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
