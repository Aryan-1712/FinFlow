"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { expenseCategories } from "@/lib/dummy-data"
import type { Expense } from "@/services/api"
import { X } from "lucide-react"

interface ExpenseFormProps {
  expense?: Expense
  onSubmit: (data: Omit<Expense, "id">) => void
  onCancel: () => void
}

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState(expense?.amount?.toString() || "")
  const [category, setCategory] = useState(expense?.category || "")
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState(expense?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category || !date) return

    onSubmit({
      amount: parseFloat(amount),
      category,
      date,
      notes: notes || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {expense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Add a note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {expense ? "Update" : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
