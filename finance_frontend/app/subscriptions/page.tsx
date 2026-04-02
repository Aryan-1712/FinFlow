"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { subscriptions as initialSubscriptions } from "@/lib/dummy-data"
import type { Subscription } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getLastUsedText(lastUsed?: string) {
  if (!lastUsed) return "Never used"
  const days = Math.floor(
    (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return "Used today"
  if (days === 1) return "Used yesterday"
  if (days < 7) return `Used ${days} days ago`
  if (days < 30) return `Used ${Math.floor(days / 7)} weeks ago`
  return `Used ${Math.floor(days / 30)} months ago`
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    Entertainment: "🎬",
    Shopping: "🛒",
    Productivity: "💼",
    Health: "🏃",
    Storage: "☁️",
    Education: "📚",
  }
  return icons[category] || "📦"
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    initialSubscriptions
  )

  // Calculate totals
  const totalMonthlyCost = useMemo(() => {
    return subscriptions
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        if (s.billingCycle === "yearly") {
          return sum + s.cost / 12
        }
        return sum + s.cost
      }, 0)
  }, [subscriptions])

  const activeCount = subscriptions.filter((s) => s.isActive).length
  const unusedCount = subscriptions.filter((s) => s.cancelSuggested).length

  const handleToggleSubscription = (id: string) => {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      )
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
                Subscription Tracker
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and optimize your recurring expenses
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Monthly Cost</span>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalMonthlyCost)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(totalMonthlyCost * 12)}/year
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-3xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                subscriptions active
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground">Unused</span>
              </div>
              <p className="text-3xl font-bold">{unusedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                consider cancelling
              </p>
            </div>
          </div>

          {/* Unused Subscriptions Alert */}
          {unusedCount > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Potential Savings Detected
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {unusedCount} subscription
                    {unusedCount > 1 ? "s" : ""} that{" "}
                    {unusedCount > 1 ? "haven't" : "hasn't"} been used recently.
                    Consider cancelling to save money.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions List */}
          <div className="flex flex-col gap-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className={cn(
                  "bg-card border rounded-xl p-5 transition-all duration-300 hover:shadow-lg",
                  subscription.cancelSuggested
                    ? "border-warning/30"
                    : "border-border",
                  !subscription.isActive && "opacity-60"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon and Name */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                      {getCategoryIcon(subscription.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {subscription.name}
                        </h3>
                        {subscription.cancelSuggested && (
                          <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
                            Cancel Suggested
                          </Badge>
                        )}
                        {!subscription.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{subscription.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getLastUsedText(subscription.lastUsed)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatCurrency(subscription.cost)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{subscription.billingCycle === "yearly" ? "year" : "month"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={subscription.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleSubscription(subscription.id)}
                      >
                        {subscription.isActive ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reactivate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Section */}
          <div className="mt-6 bg-card border border-border rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Total Monthly Subscriptions</h3>
                <p className="text-sm text-muted-foreground">
                  {activeCount} active subscriptions
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(totalMonthlyCost)}
                  <span className="text-base font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalMonthlyCost * 12)}/year
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
