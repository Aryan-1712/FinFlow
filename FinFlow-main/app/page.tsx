"use client"

import { Navigation } from "@/components/navigation"
import { StatCard } from "@/components/stat-card"
import { InsightCard } from "@/components/insight-card"
import { HealthScore } from "@/components/health-score"
import { dashboardData } from "@/lib/dummy-data"
import { Wallet, PiggyBank, CreditCard, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Good morning, Arjun
              </h1>
              <p className="text-muted-foreground mt-1">
                {"Here's your financial overview for March 2024"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/subscriptions">
                  <Eye className="w-4 h-4 mr-2" />
                  View Subscriptions
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/expenses">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Link>
              </Button>
            </div>
          </div>

          {/* Health Score + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            {/* Health Score Card */}
            <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Financial Health Score
              </h3>
              <HealthScore score={dashboardData.healthScore} size="md" />
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Based on your spending, savings, and financial habits
              </p>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Total Spending"
                value={formatCurrency(dashboardData.totalSpending)}
                subtitle="This month"
                icon={Wallet}
                trend={{ value: -5, label: "vs last month" }}
              />
              <StatCard
                title="Total Savings"
                value={formatCurrency(dashboardData.totalSavings)}
                subtitle="This month"
                icon={PiggyBank}
                trend={{ value: 15, label: "vs last month" }}
                iconClassName="bg-success/10"
              />
              <StatCard
                title="Subscriptions"
                value={formatCurrency(dashboardData.subscriptionCost)}
                subtitle="8 active subscriptions"
                icon={CreditCard}
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Expense Categories Pie Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Expense Categories
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.spendingByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend Line Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Monthly Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
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
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground capitalize">
                          {value}
                        </span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="spending"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-4))", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="savings"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">AI Insights</h3>
              <Link
                href="/insights"
                className="text-sm text-primary hover:underline"
              >
                View all insights
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/expenses"
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Add Expense</span>
            </Link>
            <Link
              href="/subscriptions"
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-chart-2" />
              </div>
              <span className="text-sm font-medium">Subscriptions</span>
            </Link>
            <Link
              href="/tax"
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-chart-3" />
              </div>
              <span className="text-sm font-medium">Tax Assistant</span>
            </Link>
            <Link
              href="/habits"
              className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PiggyBank className="w-6 h-6 text-chart-5" />
              </div>
              <span className="text-sm font-medium">Build Habits</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
