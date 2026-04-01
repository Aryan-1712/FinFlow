// ─────────────────────────────────────────────────────────────────────────────
// services/api.ts  —  FinFlow frontend API client
// Connects to Django + DRF backend at http://127.0.0.1:8000
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

// ── Token storage ─────────────────────────────────────────────────────────────

export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  },
  set: (token: string) => localStorage.setItem("access_token", token),
  getRefresh: () => localStorage.getItem("refresh_token"),
  setRefresh: (token: string) => localStorage.setItem("refresh_token", token),
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = tokenStorage.get()

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  // Auto-refresh on 401
  if (response.status === 401) {
    const refresh = tokenStorage.getRefresh()
    if (refresh) {
      const refreshRes = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        tokenStorage.set(data.access)
        // Retry original request
        return fetchApi<T>(endpoint, options)
      }
    }
    tokenStorage.clear()
    if (typeof window !== "undefined") window.location.href = "/login"
    throw new Error("Session expired")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `API Error: ${response.status} ${response.statusText}`)
  }

  // Handle 204 No Content (DELETE)
  if (response.status === 204) return undefined as T

  return response.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (matched to Django serializer field names)
// ─────────────────────────────────────────────────────────────────────────────

// Auth
export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}

// ── Expense ───────────────────────────────────────────────────────────────────
// Backend field: description  → Frontend display: notes
export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  notes?: string          // maps to "description" on the backend
  is_subscription?: boolean
}

export interface ExpenseCreatePayload {
  amount: number
  category: string
  date: string
  description?: string    // sent as "description" to backend
  is_subscription?: boolean
}

// ── Subscription ──────────────────────────────────────────────────────────────
export interface Subscription {
  id: string
  name: string
  cost: number            // maps to "amount" on backend
  billingCycle: "monthly" | "yearly" | "weekly" | "quarterly"  // maps to "billing_cycle"
  category: string        // derived from name on backend; stored in frontend only
  isActive: boolean       // maps to "is_active"
  lastUsed?: string       // not on backend — frontend UI only
  cancelSuggested?: boolean // computed on frontend from lastUsed
  next_payment_date?: string
  monthly_equivalent?: number
}

// ── Tax ───────────────────────────────────────────────────────────────────────
export interface TaxSection {
  section: string         // maps to "category" on backend
  name: string            // human-readable label
  maxLimit: number
  invested: number        // sum of amounts for this category
  expenses: { name: string; amount: number }[]
}

// ── Insights ──────────────────────────────────────────────────────────────────
export interface SpendingInsight {
  type: "warning" | "tip" | "achievement" | "suggestion" | "info"
  title: string
  description: string
  actionLabel?: string
}

// ── Habits ────────────────────────────────────────────────────────────────────
export interface Challenge {
  id: string
  title: string           // maps to "name"
  description: string
  progress: number
  target: number          // maps to "target_amount"
  streak: number
  completed: boolean      // derived: progress >= target
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardData {
  healthScore: number
  totalSpending: number
  totalSavings: number
  subscriptionCost: number
  spendingByCategory: { name: string; value: number; color: string }[]
  monthlyTrend: { month: string; spending: number; savings: number }[]
  insights: SpendingInsight[]
}

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER HELPERS  — transform backend snake_case → frontend camelCase
// ─────────────────────────────────────────────────────────────────────────────

// Map backend category slugs to frontend display labels
const CATEGORY_LABEL_MAP: Record<string, string> = {
  food: "Food & Dining",
  transport: "Transport",
  entertainment: "Entertainment",
  utilities: "Bills & Utilities",
  health: "Health",
  shopping: "Shopping",
  education: "Education",
  travel: "Travel",
  subscription: "Subscription",
  investment: "Investment",
  other: "Others",
}

// Map frontend display labels back to backend slugs
const CATEGORY_SLUG_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_LABEL_MAP).map(([k, v]) => [v, k])
)

function toFrontendCategory(slug: string): string {
  return CATEGORY_LABEL_MAP[slug] ?? slug
}

function toBackendCategory(label: string): string {
  return CATEGORY_SLUG_MAP[label] ?? label.toLowerCase()
}

// Map backend insight types to frontend types
function toInsightType(backendType: string): SpendingInsight["type"] {
  const map: Record<string, SpendingInsight["type"]> = {
    warning: "warning",
    suggestion: "tip",
    info: "info",
    achievement: "achievement",
  }
  return map[backendType] ?? "info"
}

// Extract a short title from the backend insight message
function extractInsightTitle(message: string): string {
  if (message.includes("food") || message.includes("Food")) return "High Food Spending"
  if (message.includes("subscription") || message.includes("Subscription")) return "Subscription Alert"
  if (message.includes("entertainment") || message.includes("Entertainment")) return "Entertainment Spending"
  if (message.includes("upcoming") || message.includes("Upcoming")) return "Upcoming Payment"
  if (message.includes("higher") || message.includes("spike")) return "Spending Spike"
  if (message.includes("less") || message.includes("Great job")) return "Savings Achievement"
  if (message.includes("shopping") || message.includes("Shopping")) return "Shopping Alert"
  return "Financial Insight"
}

// Map backend Expense to frontend Expense
function adaptExpense(e: any): Expense {
  return {
    id: String(e.id),
    amount: parseFloat(e.amount),
    category: toFrontendCategory(e.category),
    date: e.date,
    notes: e.description || undefined,
    is_subscription: e.is_subscription,
  }
}

// Map backend Subscription to frontend Subscription
function adaptSubscription(s: any): Subscription {
  const lastUsed = undefined // backend doesn't track last_used yet
  return {
    id: String(s.id),
    name: s.name,
    cost: parseFloat(s.amount),
    billingCycle: s.billing_cycle as Subscription["billingCycle"],
    category: guessCategoryFromName(s.name),
    isActive: s.is_active,
    lastUsed,
    cancelSuggested: !s.is_active,
    next_payment_date: s.next_payment_date,
    monthly_equivalent: s.monthly_equivalent,
  }
}

// Guess a display category from subscription name
function guessCategoryFromName(name: string): string {
  const n = name.toLowerCase()
  if (["netflix", "hotstar", "prime video", "spotify", "youtube", "pvr"].some(k => n.includes(k))) return "Entertainment"
  if (["adobe", "notion", "github", "slack", "zoom", "microsoft"].some(k => n.includes(k))) return "Productivity"
  if (["gym", "health", "fitness", "yoga"].some(k => n.includes(k))) return "Health"
  if (["amazon", "flipkart"].some(k => n.includes(k))) return "Shopping"
  if (["icloud", "google one", "dropbox"].some(k => n.includes(k))) return "Storage"
  if (["udemy", "coursera", "medium", "kindle"].some(k => n.includes(k))) return "Education"
  return "Other"
}

// Map backend Habit to frontend Challenge
function adaptHabit(h: any): Challenge {
  const progress = parseFloat(h.progress)
  const target = parseFloat(h.target_amount)
  return {
    id: String(h.id),
    title: h.name,
    description: `Target: ₹${target.toLocaleString("en-IN")}`,
    progress,
    target,
    streak: h.streak,
    completed: progress >= target,
  }
}

// Map backend Insight to frontend SpendingInsight
function adaptInsight(i: any): SpendingInsight {
  const type = toInsightType(i.type)
  return {
    type,
    title: extractInsightTitle(i.message),
    description: i.message,
    actionLabel:
      type === "warning" ? "View Details"
      : type === "tip" ? "Take Action"
      : undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TAX SECTION LABELS
// ─────────────────────────────────────────────────────────────────────────────

const TAX_SECTION_META: Record<string, { name: string; maxLimit: number }> = {
  "80C":   { name: "Investments & Savings",   maxLimit: 150000 },
  "80D":   { name: "Health Insurance",         maxLimit: 75000  },
  "80E":   { name: "Education Loan Interest",  maxLimit: 0      },
  "80G":   { name: "Donations",                maxLimit: 100000 },
  "80TTA": { name: "Savings Account Interest", maxLimit: 10000  },
  "HRA":   { name: "House Rent Allowance",     maxLimit: 0      },
  "LTA":   { name: "Leave Travel Allowance",   maxLimit: 0      },
  "other": { name: "Other Deductions",         maxLimit: 0      },
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────────

  login: async (username: string, password: string): Promise<AuthTokens> => {
    const data = await fetchApi<AuthTokens>("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
    tokenStorage.set(data.access)
    tokenStorage.setRefresh(data.refresh)
    return data
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    return fetchApi<User>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  logout: () => tokenStorage.clear(),

  getProfile: (): Promise<User> => fetchApi<User>("/auth/profile/"),

  updateProfile: (data: Partial<User>): Promise<User> =>
    fetchApi<User>("/auth/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (oldPassword: string, newPassword: string): Promise<{ message: string }> =>
    fetchApi("/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    }),

  // ── Dashboard ───────────────────────────────────────────────────────────────

  getDashboardData: async (): Promise<DashboardData> => {
    const raw = await fetchApi<any>("/dashboard/")

    const spendingByCategory = Object.entries(
      raw.category_breakdown as Record<string, number>
    ).map(([slug, value], i) => ({
      name: toFrontendCategory(slug),
      value,
      color: `var(--chart-${(i % 5) + 1})`,
    }))

    const monthlyTrend = (raw.monthly_trend as any[]).map((m: any) => ({
      month: m.month.split(" ")[0], // "Jan 2024" → "Jan"
      spending: m.total,
      savings: 0, // backend doesn't track income yet; 0 as placeholder
    }))

    const insights = (raw.recent_insights as any[])
      .slice(0, 3)
      .map(adaptInsight)

    return {
      healthScore: raw.financial_health.score,
      totalSpending: raw.summary.total_expenses_this_month,
      totalSavings: 0, // backend doesn't store income; extend later
      subscriptionCost: raw.summary.subscription_total_monthly,
      spendingByCategory,
      monthlyTrend,
      insights,
    }
  },

  // ── Expenses ────────────────────────────────────────────────────────────────

  getExpenses: async (filters?: {
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<Expense[]> => {
    const params = new URLSearchParams()
    if (filters?.category && filters.category !== "all") {
      params.append("category", toBackendCategory(filters.category))
    }
    if (filters?.startDate) params.append("start_date", filters.startDate)
    if (filters?.endDate) params.append("end_date", filters.endDate)
    const query = params.toString() ? `?${params.toString()}` : ""
    const raw = await fetchApi<any[]>(`/expenses/${query}`)
    return raw.map(adaptExpense)
  },

  createExpense: async (expense: Omit<Expense, "id">): Promise<Expense> => {
    const payload: ExpenseCreatePayload = {
      amount: expense.amount,
      category: toBackendCategory(expense.category),
      date: expense.date,
      description: expense.notes,
    }
    const raw = await fetchApi<any>("/expenses/", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return adaptExpense(raw)
  },

  updateExpense: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    const payload: Partial<ExpenseCreatePayload> = {}
    if (expense.amount !== undefined) payload.amount = expense.amount
    if (expense.category !== undefined) payload.category = toBackendCategory(expense.category)
    if (expense.date !== undefined) payload.date = expense.date
    if (expense.notes !== undefined) payload.description = expense.notes
    const raw = await fetchApi<any>(`/expenses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return adaptExpense(raw)
  },

  deleteExpense: (id: string): Promise<void> =>
    fetchApi<void>(`/expenses/${id}/`, { method: "DELETE" }),

  getExpenseAnalysis: async (month?: string) => {
    const query = month ? `?month=${month}` : ""
    const raw = await fetchApi<any>(`/expenses/analysis/${query}`)
    return {
      categoryBreakdown: Object.fromEntries(
        Object.entries(raw.category_breakdown as Record<string, number>).map(
          ([k, v]) => [toFrontendCategory(k), v]
        )
      ),
      categoryPercentages: Object.fromEntries(
        Object.entries(raw.category_percentages as Record<string, number>).map(
          ([k, v]) => [toFrontendCategory(k), v]
        )
      ),
      weekendVsWeekday: raw.weekend_vs_weekday,
      monthlyTotals: raw.monthly_totals,
    }
  },

  // ── Subscriptions ───────────────────────────────────────────────────────────

  getSubscriptions: async (): Promise<Subscription[]> => {
    const raw = await fetchApi<any[]>("/subscriptions/")
    return raw.map(adaptSubscription)
  },

  createSubscription: async (data: {
    name: string
    cost: number
    billingCycle: string
    next_payment_date: string
  }): Promise<Subscription> => {
    const raw = await fetchApi<any>("/subscriptions/", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        amount: data.cost,
        billing_cycle: data.billingCycle,
        next_payment_date: data.next_payment_date,
      }),
    })
    return adaptSubscription(raw)
  },

  updateSubscription: async (id: string, data: Partial<Subscription>): Promise<Subscription> => {
    const payload: Record<string, any> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.cost !== undefined) payload.amount = data.cost
    if (data.billingCycle !== undefined) payload.billing_cycle = data.billingCycle
    if (data.isActive !== undefined) payload.is_active = data.isActive
    if (data.next_payment_date !== undefined) payload.next_payment_date = data.next_payment_date
    const raw = await fetchApi<any>(`/subscriptions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return adaptSubscription(raw)
  },

  deleteSubscription: (id: string): Promise<void> =>
    fetchApi<void>(`/subscriptions/${id}/`, { method: "DELETE" }),

  getSubscriptionSummary: () => fetchApi<{
    active_count: number
    monthly_total: number
    yearly_total: number
  }>("/subscriptions/summary/"),

  // ── Tax ─────────────────────────────────────────────────────────────────────

  getTaxData: async (financialYear?: string): Promise<{
    sections: TaxSection[]
    totalSavings: number
    oldRegimeTax: number
    newRegimeTax: number
  }> => {
    // Fetch all tax records
    const query = financialYear ? `?financial_year=${financialYear}` : ""
    const records = await fetchApi<any[]>(`/tax/${query}`)

    // Group by section/category
    const grouped: Record<string, any[]> = {}
    for (const r of records) {
      if (!grouped[r.category]) grouped[r.category] = []
      grouped[r.category].push(r)
    }

    const sections: TaxSection[] = Object.entries(grouped).map(([cat, recs]) => {
      const meta = TAX_SECTION_META[cat] ?? { name: cat, maxLimit: 0 }
      const invested = recs.reduce((sum, r) => sum + parseFloat(r.amount), 0)
      return {
        section: cat,
        name: meta.name,
        maxLimit: meta.maxLimit,
        invested,
        expenses: recs.map(r => ({ name: r.description || cat, amount: parseFloat(r.amount) })),
      }
    })

    const totalSavings = sections.reduce((sum, s) => sum + s.invested, 0)
    // Simplified tax calc (FY 2024-25 slabs)
    const oldRegimeTax = Math.max(0, (totalSavings * 0.3) - sections.reduce((s, sec) => s + sec.invested * 0.15, 0))
    const newRegimeTax = Math.max(0, totalSavings * 0.2)

    return { sections, totalSavings, oldRegimeTax, newRegimeTax }
  },

  createTaxRecord: (data: {
    category: string
    amount: number
    description?: string
    financial_year?: string
  }) => fetchApi<any>("/tax/", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  getTaxSummary: (financialYear?: string) => {
    const query = financialYear ? `?financial_year=${financialYear}` : ""
    return fetchApi<{ financial_year: string; by_category: Record<string, number>; total: number }>(
      `/tax/summary/${query}`
    )
  },

  // ── Insights ────────────────────────────────────────────────────────────────

  getInsights: async (): Promise<{
    weeklySpending: { day: string; amount: number }[]
    categoryTrends: { category: string; trend: number; amount: number }[]
    userType: "saver" | "impulsive" | "balanced"
    score: number
  }> => {
    // Fetch insights + expense analysis together
    const [insightsList, analysis, health] = await Promise.all([
      fetchApi<any[]>("/insights/"),
      fetchApi<any>("/expenses/analysis/"),
      fetchApi<any>("/dashboard/").then((d: any) => d.financial_health).catch(() => ({ score: 50 })),
    ])

    // Build weekly spending from monthly data (approximate)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const weeklySpending = days.map(day => ({
      day,
      amount: Math.floor(Math.random() * 3000) + 500, // placeholder until backend tracks daily
    }))

    // Build category trends from analysis
    const breakdown = analysis.category_breakdown as Record<string, number>
    const categoryTrends = Object.entries(breakdown).map(([slug, amount]) => ({
      category: toFrontendCategory(slug),
      trend: Math.floor(Math.random() * 30) - 10, // placeholder until backend tracks MoM %
      amount,
    }))

    // Determine user type from health score
    const score: number = health.score ?? 50
    const userType: "saver" | "impulsive" | "balanced" =
      score >= 70 ? "saver" : score <= 40 ? "impulsive" : "balanced"

    return { weeklySpending, categoryTrends, userType, score }
  },

  generateInsights: async (): Promise<SpendingInsight[]> => {
    const raw = await fetchApi<any>("/insights/generate/", { method: "POST" })
    return (raw.insights as any[]).map(adaptInsight)
  },

  markInsightRead: (id: string) =>
    fetchApi<any>(`/insights/${id}/mark_read/`, { method: "PATCH" }),

  // ── Habits ──────────────────────────────────────────────────────────────────

  getHabits: async (): Promise<{
    challenges: Challenge[]
    badges: Badge[]
    totalStreak: number
  }> => {
    const raw = await fetchApi<any[]>("/habits/")
    const challenges = raw.map(adaptHabit)
    const totalStreak = challenges.reduce((max, c) => Math.max(max, c.streak), 0)

    // Badges are not stored in backend yet — derive from habit data
    const badges: Badge[] = [
      {
        id: "b1",
        name: "First Steps",
        description: "Created your first habit",
        icon: "trophy",
        earned: raw.length > 0,
        earnedDate: raw[0]?.created_at?.split("T")[0],
      },
      {
        id: "b2",
        name: "Streak Master",
        description: "Maintained a 7-day streak",
        icon: "flame",
        earned: totalStreak >= 7,
      },
      {
        id: "b3",
        name: "Budget Boss",
        description: "Completed all habits in a week",
        icon: "crown",
        earned: challenges.filter(c => c.completed).length === challenges.length && challenges.length > 0,
      },
      {
        id: "b4",
        name: "Savings Star",
        description: "Reached a savings habit target",
        icon: "star",
        earned: challenges.some(c => c.completed && c.target >= 1000),
      },
      {
        id: "b5",
        name: "Expense Expert",
        description: "Built a streak of 5+ days",
        icon: "chart",
        earned: totalStreak >= 5,
      },
      {
        id: "b6",
        name: "Habit Hero",
        description: "Created 3 or more habits",
        icon: "scissors",
        earned: raw.length >= 3,
      },
    ]

    return { challenges, badges, totalStreak }
  },

  createHabit: async (data: {
    name: string
    target_amount: number
  }): Promise<Challenge> => {
    const raw = await fetchApi<any>("/habits/", {
      method: "POST",
      body: JSON.stringify({ name: data.name, target_amount: data.target_amount, progress: 0 }),
    })
    return adaptHabit(raw)
  },

  updateHabitProgress: async (id: string, progress: number): Promise<Challenge> => {
    const raw = await fetchApi<any>(`/habits/${id}/progress/`, {
      method: "PATCH",
      body: JSON.stringify({ progress }),
    })
    return adaptHabit(raw)
  },

  deleteHabit: (id: string): Promise<void> =>
    fetchApi<void>(`/habits/${id}/`, { method: "DELETE" }),
}

export default api
