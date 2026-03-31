# 💰 AI Personal Finance Backend

A robust Django + Django REST Framework backend powering an AI-assisted personal finance application. Includes expense tracking, subscription management, tax records, habit tracking, and a rule-based AI insights engine.

---

## 🗂️ Project Structure

```
finance_backend/
├── finance_backend/          # Django project config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/                      # Main application
│   ├── models.py             # All domain models
│   ├── serializers.py        # DRF serializers
│   ├── views.py              # ViewSets + APIViews
│   ├── urls.py               # API URL routing
│   ├── admin.py              # Django Admin config
│   ├── services/
│   │   ├── categorizer.py    # Keyword-based auto-categorisation
│   │   ├── analytics.py      # Spending analysis & health score
│   │   └── insights_engine.py # Rule-based AI insights
│   └── management/
│       └── commands/
│           └── seed_demo.py  # Demo data seeder
├── manage.py
├── requirements.txt
└── .env.example
```

---

## ⚡ Quick Start

### 1. Clone & create a virtual environment
```bash
git clone <your-repo>
cd finance_backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — at minimum, set DJANGO_SECRET_KEY
```

### 4. Run migrations
```bash
python manage.py migrate
```

### 5. (Optional) Seed demo data
```bash
python manage.py seed_demo
# Creates user: demo / demo1234
```

### 6. Start the development server
```bash
python manage.py runserver
```

API is now live at **http://127.0.0.1:8000/api/**  
Admin panel: **http://127.0.0.1:8000/admin/**

---

## 🔐 Authentication

JWT-based authentication via `djangorestframework-simplejwt`.

### Register
```
POST /api/auth/register/
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "strongpassword",
  "password2": "strongpassword"
}
```

### Obtain tokens
```
POST /api/auth/token/
{ "username": "alice", "password": "strongpassword" }

→ { "access": "<JWT>", "refresh": "<JWT>" }
```

### Refresh token
```
POST /api/auth/token/refresh/
{ "refresh": "<refresh_token>" }
```

### Use token in all subsequent requests
```
Authorization: Bearer <access_token>
```

### View / update profile
```
GET  /api/auth/profile/
PATCH /api/auth/profile/  { "first_name": "Alice" }
```

---

## 📡 API Endpoints

### Expenses — `/api/expenses/`

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/expenses/` | List all expenses (supports filters) |
| POST | `/api/expenses/` | Create expense (auto-categorises) |
| GET | `/api/expenses/{id}/` | Retrieve single expense |
| PUT/PATCH | `/api/expenses/{id}/` | Update expense |
| DELETE | `/api/expenses/{id}/` | Delete expense |
| GET | `/api/expenses/analysis/` | Spending analysis for a month |

**Query filters:** `?category=food`, `?start_date=2024-01-01`, `?end_date=2024-01-31`, `?is_subscription=true`

**Analysis query params:** `?month=2024-06` (defaults to current month)

**Create payload:**
```json
{
  "amount": 450.00,
  "description": "Zomato biryani order",
  "date": "2024-06-15",
  "category": "other",
  "is_subscription": false
}
```
> `category` and `is_subscription` are auto-detected from `description` if not provided.

---

### Subscriptions — `/api/subscriptions/`

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/subscriptions/` | List subscriptions |
| POST | `/api/subscriptions/` | Create subscription |
| GET/PUT/PATCH/DELETE | `/api/subscriptions/{id}/` | CRUD single |
| GET | `/api/subscriptions/summary/` | Monthly/yearly cost totals |

**Create payload:**
```json
{
  "name": "Netflix",
  "amount": 649.00,
  "billing_cycle": "monthly",
  "next_payment_date": "2024-07-01"
}
```

---

### Tax Records — `/api/tax/`

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/tax/` | List tax records |
| POST | `/api/tax/` | Create tax record |
| GET/PUT/PATCH/DELETE | `/api/tax/{id}/` | CRUD single |
| GET | `/api/tax/summary/` | Category-wise totals |

**Query filters:** `?financial_year=2024-25`, `?category=80C`

**Create payload:**
```json
{
  "category": "80C",
  "amount": 50000.00,
  "description": "PPF deposit",
  "financial_year": "2024-25"
}
```

**Supported tax categories:** `80C`, `80D`, `80E`, `80G`, `80TTA`, `HRA`, `LTA`, `other`

---

### Habits — `/api/habits/`

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/habits/` | List habits |
| POST | `/api/habits/` | Create habit |
| GET/PUT/PATCH/DELETE | `/api/habits/{id}/` | CRUD single |
| PATCH | `/api/habits/{id}/progress/` | Update progress & streak |

**Create payload:**
```json
{
  "name": "Save ₹5000 this month",
  "target_amount": 5000.00,
  "progress": 0
}
```

**Progress update:**
```json
PATCH /api/habits/1/progress/
{ "progress": 3200 }
```
Streak auto-increments when `progress >= target_amount`.

---

### Insights — `/api/insights/`

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/insights/` | List insights |
| GET | `/api/insights/{id}/` | Retrieve single |
| PATCH | `/api/insights/{id}/` | Update (e.g. mark read) |
| DELETE | `/api/insights/{id}/` | Delete insight |
| POST | `/api/insights/generate/` | Trigger AI insight regeneration |
| PATCH | `/api/insights/{id}/mark_read/` | Mark a single insight as read |

**Query filters:** `?type=warning`, `?is_read=false`

---

### Dashboard — `/api/dashboard/`

```
GET /api/dashboard/
```

Returns a consolidated financial snapshot:

```json
{
  "summary": {
    "total_expenses_this_month": 18450.00,
    "subscription_total_monthly": 2100.50,
    "active_subscriptions": 5,
    "unread_insights": 3
  },
  "category_breakdown": { "food": 4200, "transport": 1800, ... },
  "category_percentages": { "food": 22.7, "transport": 9.8, ... },
  "monthly_trend": [
    { "month": "Jan 2024", "total": 15200 }, ...
  ],
  "weekend_vs_weekday": {
    "weekend": 4800, "weekday": 13650,
    "weekend_pct": 26.0, "weekday_pct": 74.0
  },
  "financial_health": {
    "score": 72,
    "grade": "Good",
    "breakdown": { "savings_score": 28, "subscription_score": 22, "spending_score": 22 },
    "monthly_spending": 18450.00,
    "monthly_subscription_cost": 2100.50
  },
  "recent_insights": [ ... ]
}
```

---

## 🧠 Intelligence Features

### Auto-Categorisation
When creating an expense, if `category` is `"other"` (or omitted), the engine scans `description` against keyword dictionaries for categories like `food`, `transport`, `entertainment`, `utilities`, `health`, `shopping`, `education`, `travel`, `investment`, and `subscription`.

### Subscription Detection
Expenses with service names like `Netflix`, `Spotify`, `Prime`, `Adobe`, etc. in the description are automatically flagged as `is_subscription: true`.

### Financial Health Score (0–100)
| Component | Weight | Logic |
|-----------|--------|-------|
| Savings ratio | 40 pts | Month-over-month spending change |
| Subscription load | 30 pts | Subscriptions as % of total spending |
| Unnecessary spending | 30 pts | Entertainment + Shopping as % of total |

**Grades:** Excellent (80+) · Good (60–79) · Fair (40–59) · Needs Attention (<40)

### AI Insights Rules
| Rule | Trigger | Type |
|------|---------|------|
| Food overspend | Food > 30% of spending | `warning` |
| Subscription overload | Subs > 15% of spending | `suggestion` |
| Too many subscriptions | >5 active subs | `suggestion` |
| Entertainment overspend | Entertainment > 20% | `warning` |
| Upcoming payment | Subscription due in ≤3 days | `info` |
| Spending spike | This month > last month by 30% | `warning` |
| Positive reinforcement | This month < last month by 15% | `achievement` |
| High shopping | Shopping > 25% of spending | `suggestion` |

---

## 🗄️ Using PostgreSQL

Set the `DATABASE_URL` in your `.env`:
```
DATABASE_URL=postgres://user:password@localhost:5432/finance_db
```
Install the adapter:
```bash
pip install psycopg2-binary
```

---

## 🛠️ Development Commands

```bash
# Create and apply a new migration
python manage.py makemigrations
python manage.py migrate

# Create a superuser manually
python manage.py createsuperuser

# Seed demo data
python manage.py seed_demo

# Seed with custom credentials
python manage.py seed_demo --username admin --password secret123

# Django shell for testing
python manage.py shell
```
