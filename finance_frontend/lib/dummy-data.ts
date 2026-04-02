import type { Expense, Subscription, TaxSection, SpendingInsight, Challenge, Badge } from "@/services/api"

// Dashboard data
export const dashboardData = {
  healthScore: 78,
  totalSpending: 45620,
  totalSavings: 28400,
  subscriptionCost: 2499,
  spendingByCategory: [
    { name: "Food & Dining", value: 12500, color: "var(--chart-1)" },
    { name: "Shopping", value: 8900, color: "var(--chart-2)" },
    { name: "Transport", value: 6200, color: "var(--chart-3)" },
    { name: "Entertainment", value: 5800, color: "var(--chart-4)" },
    { name: "Bills & Utilities", value: 7200, color: "var(--chart-5)" },
    { name: "Others", value: 5020, color: "var(--muted-foreground)" },
  ],
  monthlyTrend: [
    { month: "Oct", spending: 38000, savings: 22000 },
    { month: "Nov", spending: 42000, savings: 25000 },
    { month: "Dec", spending: 52000, savings: 18000 },
    { month: "Jan", spending: 41000, savings: 29000 },
    { month: "Feb", spending: 39000, savings: 31000 },
    { month: "Mar", spending: 45620, savings: 28400 },
  ],
  insights: [
    {
      type: "warning" as const,
      title: "High Food Spending",
      description: "Your food expenses are 23% higher than last month. Consider meal prepping to save more.",
      actionLabel: "View Details",
    },
    {
      type: "tip" as const,
      title: "Unused Subscription",
      description: "You haven't used Spotify in 45 days. Consider cancelling to save Rs 199/month.",
      actionLabel: "Manage Subscriptions",
    },
    {
      type: "achievement" as const,
      title: "Savings Goal Met!",
      description: "You've saved Rs 28,400 this month - 15% more than your target!",
    },
  ],
}

// Expenses data
export const expenses: Expense[] = [
  { id: "1", amount: 450, category: "Food & Dining", date: "2024-03-28", notes: "Lunch at cafe" },
  { id: "2", amount: 2500, category: "Shopping", date: "2024-03-27", notes: "New headphones" },
  { id: "3", amount: 150, category: "Transport", date: "2024-03-27", notes: "Uber ride" },
  { id: "4", amount: 799, category: "Entertainment", date: "2024-03-26", notes: "Movie tickets" },
  { id: "5", amount: 1200, category: "Bills & Utilities", date: "2024-03-25", notes: "Electricity bill" },
  { id: "6", amount: 350, category: "Food & Dining", date: "2024-03-25", notes: "Groceries" },
  { id: "7", amount: 3500, category: "Shopping", date: "2024-03-24", notes: "Clothing" },
  { id: "8", amount: 200, category: "Transport", date: "2024-03-24", notes: "Metro card recharge" },
  { id: "9", amount: 550, category: "Food & Dining", date: "2024-03-23", notes: "Dinner with friends" },
  { id: "10", amount: 999, category: "Entertainment", date: "2024-03-22", notes: "Gaming subscription" },
  { id: "11", amount: 1800, category: "Bills & Utilities", date: "2024-03-20", notes: "Internet bill" },
  { id: "12", amount: 650, category: "Food & Dining", date: "2024-03-19", notes: "Coffee shop" },
]

// Subscriptions data
export const subscriptions: Subscription[] = [
  { id: "1", name: "Netflix", cost: 649, billingCycle: "monthly", category: "Entertainment", isActive: true, lastUsed: "2024-03-28" },
  { id: "2", name: "Spotify", cost: 199, billingCycle: "monthly", category: "Entertainment", isActive: true, lastUsed: "2024-02-10", cancelSuggested: true },
  { id: "3", name: "Amazon Prime", cost: 1499, billingCycle: "yearly", category: "Shopping", isActive: true, lastUsed: "2024-03-27" },
  { id: "4", name: "YouTube Premium", cost: 139, billingCycle: "monthly", category: "Entertainment", isActive: true, lastUsed: "2024-03-28" },
  { id: "5", name: "Adobe Creative Cloud", cost: 1675, billingCycle: "monthly", category: "Productivity", isActive: true, lastUsed: "2024-03-25" },
  { id: "6", name: "Gym Membership", cost: 2000, billingCycle: "monthly", category: "Health", isActive: true, lastUsed: "2024-01-15", cancelSuggested: true },
  { id: "7", name: "iCloud Storage", cost: 75, billingCycle: "monthly", category: "Storage", isActive: true, lastUsed: "2024-03-28" },
  { id: "8", name: "Medium", cost: 300, billingCycle: "monthly", category: "Education", isActive: false, lastUsed: "2024-02-01" },
]

// Tax data
export const taxData = {
  sections: [
    {
      section: "80C",
      name: "Investments & Savings",
      maxLimit: 150000,
      invested: 120000,
      expenses: [
        { name: "PPF", amount: 50000 },
        { name: "ELSS Mutual Funds", amount: 40000 },
        { name: "Life Insurance Premium", amount: 30000 },
      ],
    },
    {
      section: "80D",
      name: "Health Insurance",
      maxLimit: 75000,
      invested: 35000,
      expenses: [
        { name: "Self & Family Health Insurance", amount: 25000 },
        { name: "Parents Health Insurance", amount: 10000 },
      ],
    },
    {
      section: "80G",
      name: "Donations",
      maxLimit: 100000,
      invested: 15000,
      expenses: [
        { name: "PM Relief Fund", amount: 10000 },
        { name: "NGO Donation", amount: 5000 },
      ],
    },
    {
      section: "80E",
      name: "Education Loan Interest",
      maxLimit: 0,
      invested: 45000,
      expenses: [
        { name: "Education Loan Interest", amount: 45000 },
      ],
    },
  ] as TaxSection[],
  totalSavings: 64350,
  oldRegimeTax: 185000,
  newRegimeTax: 142500,
}

// Insights data
export const insightsData = {
  weeklySpending: [
    { day: "Mon", amount: 1250 },
    { day: "Tue", amount: 850 },
    { day: "Wed", amount: 2100 },
    { day: "Thu", amount: 1650 },
    { day: "Fri", amount: 3200 },
    { day: "Sat", amount: 4500 },
    { day: "Sun", amount: 2800 },
  ],
  categoryTrends: [
    { category: "Food & Dining", trend: 23, amount: 12500 },
    { category: "Shopping", trend: -8, amount: 8900 },
    { category: "Transport", trend: 5, amount: 6200 },
    { category: "Entertainment", trend: 12, amount: 5800 },
    { category: "Bills & Utilities", trend: 0, amount: 7200 },
  ],
  userType: "balanced" as const,
  score: 72,
}

// Habits data
export const habitsData = {
  challenges: [
    {
      id: "1",
      title: "No-Spend Weekend",
      description: "Go the entire weekend without any unnecessary spending",
      progress: 1,
      target: 2,
      streak: 3,
      completed: false,
    },
    {
      id: "2",
      title: "Track Every Expense",
      description: "Log all your expenses for 7 consecutive days",
      progress: 5,
      target: 7,
      streak: 5,
      completed: false,
    },
    {
      id: "3",
      title: "Save Rs 1000",
      description: "Save at least Rs 1000 this week",
      progress: 1200,
      target: 1000,
      streak: 2,
      completed: true,
    },
    {
      id: "4",
      title: "Cook at Home",
      description: "Prepare meals at home for 5 days",
      progress: 3,
      target: 5,
      streak: 1,
      completed: false,
    },
  ] as Challenge[],
  badges: [
    { id: "1", name: "First Steps", description: "Completed your first challenge", icon: "trophy", earned: true, earnedDate: "2024-03-01" },
    { id: "2", name: "Streak Master", description: "Maintained a 7-day streak", icon: "flame", earned: true, earnedDate: "2024-03-15" },
    { id: "3", name: "Budget Boss", description: "Stayed under budget for a month", icon: "crown", earned: false },
    { id: "4", name: "Savings Star", description: "Saved 20% of your income", icon: "star", earned: true, earnedDate: "2024-02-28" },
    { id: "5", name: "Expense Expert", description: "Tracked 100 expenses", icon: "chart", earned: false },
    { id: "6", name: "Subscription Slayer", description: "Cancelled 3 unused subscriptions", icon: "scissors", earned: false },
  ] as Badge[],
  totalStreak: 12,
}

// Categories
export const expenseCategories = [
  "Food & Dining",
  "Shopping",
  "Transport",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Education",
  "Others",
]
