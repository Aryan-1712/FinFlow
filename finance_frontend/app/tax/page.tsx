"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { taxData } from "@/lib/dummy-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  Calculator,
  PiggyBank,
  TrendingDown,
  ArrowRight,
  CheckCircle,
  Info,
} from "lucide-react"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function TaxPage() {
  const [selectedRegime, setSelectedRegime] = useState<"old" | "new">("new")

  const recommendedRegime =
    taxData.newRegimeTax < taxData.oldRegimeTax ? "new" : "old"
  const taxSavings = Math.abs(taxData.oldRegimeTax - taxData.newRegimeTax)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Tax Assistant
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your tax-saving investments and compare regimes
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-success" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Estimated Tax Savings
                </span>
              </div>
              <p className="text-3xl font-bold text-success">
                {formatCurrency(taxData.totalSavings)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Through deductions
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Tax Under Old Regime
                </span>
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(taxData.oldRegimeTax)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                With deductions
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-chart-2" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Tax Under New Regime
                </span>
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(taxData.newRegimeTax)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lower tax slabs
              </p>
            </div>
          </div>

          {/* Tax Regime Comparison */}
          <div className="bg-card border border-border rounded-xl p-5 mb-8">
            <h2 className="text-lg font-semibold mb-4">Tax Regime Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Regime Card */}
              <div
                onClick={() => setSelectedRegime("old")}
                className={cn(
                  "relative border rounded-xl p-5 cursor-pointer transition-all duration-300",
                  selectedRegime === "old"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                {recommendedRegime === "old" && (
                  <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                    Recommended
                  </Badge>
                )}
                <h3 className="font-semibold text-lg mb-2">Old Tax Regime</h3>
                <p className="text-3xl font-bold mb-3">
                  {formatCurrency(taxData.oldRegimeTax)}
                </p>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Claim all deductions (80C, 80D, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    HRA exemption available
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Standard deduction of Rs 50,000
                  </li>
                </ul>
              </div>

              {/* New Regime Card */}
              <div
                onClick={() => setSelectedRegime("new")}
                className={cn(
                  "relative border rounded-xl p-5 cursor-pointer transition-all duration-300",
                  selectedRegime === "new"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                {recommendedRegime === "new" && (
                  <Badge className="absolute top-3 right-3 bg-success text-success-foreground">
                    Recommended
                  </Badge>
                )}
                <h3 className="font-semibold text-lg mb-2">New Tax Regime</h3>
                <p className="text-3xl font-bold mb-3">
                  {formatCurrency(taxData.newRegimeTax)}
                </p>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Lower tax rates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Simplified structure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Standard deduction of Rs 75,000
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  You can save {formatCurrency(taxSavings)} by choosing the{" "}
                  {recommendedRegime} tax regime!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your current investments and deductions
                </p>
              </div>
            </div>
          </div>

          {/* Tax Deduction Sections */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Tax Deduction Sections</h2>
            <div className="flex flex-col gap-4">
              {taxData.sections.map((section) => {
                const percentage =
                  section.maxLimit > 0
                    ? Math.min((section.invested / section.maxLimit) * 100, 100)
                    : 100
                const remaining =
                  section.maxLimit > 0
                    ? Math.max(section.maxLimit - section.invested, 0)
                    : 0

                return (
                  <div
                    key={section.section}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{section.section}</Badge>
                          <h3 className="font-semibold">{section.name}</h3>
                        </div>
                        {section.maxLimit > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Max limit: {formatCurrency(section.maxLimit)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-success">
                          {formatCurrency(section.invested)}
                        </p>
                        {remaining > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(remaining)} remaining
                          </p>
                        )}
                      </div>
                    </div>

                    {section.maxLimit > 0 && (
                      <div className="mb-4">
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {percentage.toFixed(0)}% utilized
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {section.expenses.map((expense, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-t border-border first:border-0"
                        >
                          <span className="text-sm text-muted-foreground">
                            {expense.name}
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {remaining > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                      >
                        Add Investment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
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
