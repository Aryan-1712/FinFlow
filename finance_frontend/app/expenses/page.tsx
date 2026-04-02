"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { ExpenseForm } from "@/components/expense-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { expenses as initialExpenses, expenseCategories } from "@/lib/dummy-data"
import type { Expense } from "@/services/api"
import { Plus, Search, Pencil, Trash2, Filter, X } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || expense.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [expenses, searchQuery, categoryFilter])

  // Category breakdown for chart
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    filteredExpenses.forEach((expense) => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount
    })
    return Object.entries(breakdown).map(([name, amount]) => ({ name, amount }))
  }, [filteredExpenses])

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const handleAddExpense = (data: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...data,
      id: Date.now().toString(),
    }
    setExpenses([newExpense, ...expenses])
    setShowForm(false)
  }

  const handleEditExpense = (data: Omit<Expense, "id">) => {
    if (!editingExpense) return
    setExpenses(
      expenses.map((e) =>
        e.id === editingExpense.id ? { ...data, id: e.id } : e
      )
    )
    setEditingExpense(undefined)
    setShowForm(false)
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id))
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
                Expense Tracker
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your daily expenses
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Summary and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Summary Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Expenses
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(totalAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredExpenses.length} transactions
              </p>
            </div>

            {/* Category Breakdown Chart */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Category Breakdown
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
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
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoryFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCategoryFilter("all")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-[1fr_150px_120px_150px_100px] gap-4 p-4 border-b border-border bg-secondary/50 text-sm font-medium text-muted-foreground">
              <div>Description</div>
              <div>Category</div>
              <div>Date</div>
              <div className="text-right">Amount</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {filteredExpenses.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No expenses found. Add your first expense!
                </div>
              ) : (
                filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex flex-col md:grid md:grid-cols-[1fr_150px_120px_150px_100px] gap-2 md:gap-4 p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          expense.category === "Food & Dining" && "bg-chart-1",
                          expense.category === "Shopping" && "bg-chart-2",
                          expense.category === "Transport" && "bg-chart-3",
                          expense.category === "Entertainment" && "bg-chart-4",
                          expense.category === "Bills & Utilities" && "bg-chart-5",
                          !["Food & Dining", "Shopping", "Transport", "Entertainment", "Bills & Utilities"].includes(expense.category) && "bg-muted-foreground"
                        )}
                      />
                      <span className="font-medium truncate">
                        {expense.notes || expense.category}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground md:text-foreground">
                      <span className="md:hidden">Category: </span>
                      {expense.category}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="md:hidden">Date: </span>
                      {formatDate(expense.date)}
                    </div>
                    <div className="text-right font-semibold">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingExpense(expense)
                          setShowForm(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          onCancel={() => {
            setShowForm(false)
            setEditingExpense(undefined)
          }}
        />
      )}
    </div>
  )
}
