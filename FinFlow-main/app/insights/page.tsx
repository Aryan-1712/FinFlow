"use client"

import { Navigation } from "@/components/navigation"
import { insightsData } from "@/lib/dummy-data"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Shield,
  Activity,
  Brain,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getUserTypeConfig(type: "saver" | "impulsive" | "balanced") {
  const configs = {
    saver: {
      label: "Saver",
      description: "You prioritize saving and rarely make impulsive purchases",
      icon: Shield,
      color: "text-success",
      bgColor: "bg-success/10",
      advice: "Great job! Consider investing some of your savings for better returns.",
    },
    impulsive: {
      label: "Impulsive Spender",
      description: "You tend to make unplanned purchases frequently",
      icon: Zap,
      color: "text-warning",
      bgColor: "bg-warning/10",
      advice: "Try the 24-hour rule: wait a day before making non-essential purchases.",
    },
    balanced: {
      label: "Balanced",
      description: "You maintain a good balance between spending and saving",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
      advice: "You're doing well! Focus on optimizing your subscriptions and recurring expenses.",
    },
  }
  return configs[type]
}

export default function InsightsPage() {
  const userTypeConfig = getUserTypeConfig(insightsData.userType)
  const UserTypeIcon = userTypeConfig.icon

  const totalWeeklySpending = insightsData.weeklySpending.reduce(
    (sum, day) => sum + day.amount,
    0
  )
  const avgDailySpending = totalWeeklySpending / 7

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Spending Insights
              </h1>
              <p className="text-muted-foreground mt-1">
                Understand your spending patterns and behavior
              </p>
            </div>
          </div>

          {/* User Type Card */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center shrink-0",
                  userTypeConfig.bgColor
                )}
              >
                <UserTypeIcon className={cn("w-10 h-10", userTypeConfig.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">{userTypeConfig.label}</h2>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-sm">
                    <Brain className="w-4 h-4" />
                    <span>Score: {insightsData.score}/100</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">
                  {userTypeConfig.description}
                </p>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm">
                    <span className="font-medium">AI Tip:</span>{" "}
                    {userTypeConfig.advice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            {/* Weekly Spending Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Weekly Spending Pattern
                </h3>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(totalWeeklySpending)}
                  </p>
                  <p className="text-xs text-muted-foreground">this week</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insightsData.weeklySpending}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorSpending)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">
                  Your highest spending day is{" "}
                  <span className="font-medium text-foreground">Saturday</span> with an
                  average of{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(4500)}
                  </span>
                </p>
              </div>
            </div>

            {/* Category Trends */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Category Trends (vs last month)
              </h3>
              <div className="flex flex-col gap-4">
                {insightsData.categoryTrends.map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          category.trend > 10
                            ? "bg-destructive/10"
                            : category.trend < 0
                            ? "bg-success/10"
                            : "bg-muted"
                        )}
                      >
                        {category.trend > 0 ? (
                          <TrendingUp
                            className={cn(
                              "w-4 h-4",
                              category.trend > 10
                                ? "text-destructive"
                                : "text-warning"
                            )}
                          />
                        ) : category.trend < 0 ? (
                          <TrendingDown className="w-4 h-4 text-success" />
                        ) : (
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(category.amount)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-2 py-1 rounded text-sm font-medium",
                        category.trend > 10
                          ? "bg-destructive/10 text-destructive"
                          : category.trend > 0
                          ? "bg-warning/10 text-warning"
                          : category.trend < 0
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {category.trend > 0 ? "+" : ""}
                      {category.trend}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Average Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">
                Daily Average
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(avgDailySpending)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per day this week</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">
                Most Spent Category
              </p>
              <p className="text-2xl font-bold">Food & Dining</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(12500)} this month
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">
                Biggest Improvement
              </p>
              <p className="text-2xl font-bold text-success">Shopping</p>
              <p className="text-xs text-muted-foreground mt-1">
                Down 8% from last month
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
