"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { habitsData } from "@/lib/dummy-data"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Challenge, Badge as BadgeType } from "@/services/api"
import {
  Flame,
  Trophy,
  Star,
  Crown,
  BarChart3,
  Scissors,
  CheckCircle,
  Circle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  flame: Flame,
  crown: Crown,
  star: Star,
  chart: BarChart3,
  scissors: Scissors,
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function HabitsPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(habitsData.challenges)

  const completedChallenges = challenges.filter((c) => c.completed).length
  const earnedBadges = habitsData.badges.filter((b) => b.earned).length

  const handleUpdateProgress = (id: string) => {
    setChallenges(
      challenges.map((c) => {
        if (c.id === id && !c.completed) {
          const newProgress = c.progress + 1
          return {
            ...c,
            progress: newProgress,
            completed: newProgress >= c.target,
            streak: c.streak + 1,
          }
        }
        return c
      })
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Habit Builder
              </h1>
              <p className="text-muted-foreground mt-1">
                Build better financial habits with daily challenges
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-chart-4" />
                </div>
                <span className="text-sm text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-3xl font-bold">{habitsData.totalStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">days in a row</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-3xl font-bold">
                {completedChallenges}/{challenges.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">challenges this week</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Badges Earned</span>
              </div>
              <p className="text-3xl font-bold">
                {earnedBadges}/{habitsData.badges.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">achievements unlocked</p>
            </div>
          </div>

          {/* Active Challenges */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Active Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => {
                const progressPercent = Math.min(
                  (challenge.progress / challenge.target) * 100,
                  100
                )
                const isMonetary = challenge.target >= 100

                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      "bg-card border rounded-xl p-5 transition-all duration-300",
                      challenge.completed
                        ? "border-success/30 bg-success/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {challenge.completed ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                          <h3 className="font-semibold">{challenge.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                      {challenge.streak > 0 && (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-chart-4 border-chart-4/30 bg-chart-4/10"
                        >
                          <Flame className="w-3 h-3 mr-1" />
                          {challenge.streak}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {isMonetary
                            ? `${formatCurrency(challenge.progress)} / ${formatCurrency(challenge.target)}`
                            : `${challenge.progress} / ${challenge.target}`}
                        </span>
                      </div>
                      <Progress
                        value={progressPercent}
                        className={cn(
                          "h-2",
                          challenge.completed && "[&>div]:bg-success"
                        )}
                      />
                    </div>

                    {!challenge.completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpdateProgress(challenge.id)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Log Progress
                      </Button>
                    )}

                    {challenge.completed && (
                      <div className="flex items-center justify-center gap-2 py-2 text-sm text-success">
                        <CheckCircle className="w-4 h-4" />
                        Challenge Completed!
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Badges Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {habitsData.badges.map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Star

                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "bg-card border rounded-xl p-4 text-center transition-all duration-300",
                      badge.earned
                        ? "border-primary/30"
                        : "border-border opacity-50 grayscale"
                    )}
                  >
                    <div
                      className={cn(
                        "w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3",
                        badge.earned ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "w-7 h-7",
                          badge.earned ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.description}
                    </p>
                    {badge.earned && badge.earnedDate && (
                      <p className="text-xs text-primary mt-2">
                        Earned {new Date(badge.earnedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
