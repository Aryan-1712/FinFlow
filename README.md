# Finflow

Finflow is an AI-assisted personal finance web app for tracking expenses, monitoring subscriptions, managing tax-saving records, and understanding spending behavior through dashboard insights.

Live app: https://finflow-main.onrender.com  
Backend API: https://finflow-backend-wc4f.onrender.com  
Repository: https://github.com/Aryan-1712/FinFlow

## Features

- User authentication with JWT login and registration
- Personal dashboard with spending, savings, subscription, and health-score summaries
- Expense tracker with add, edit, delete, search, category filters, and charts
- Subscription management with billing-cycle support
- Tax assistant for recording deduction-related expenses
- Spending insights and habit tracking screens
- Light, dark, and system theme support
- Django REST API connected to a Next.js frontend
- Render deployment with production CORS and PostgreSQL configuration

## Tech Stack

**Frontend**

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Recharts
- Lucide React icons

**Backend**

- Django
- Django REST Framework
- Simple JWT
- PostgreSQL on Render
- SQLite for local development
- Gunicorn and WhiteNoise

## Project Structure

```text
FinFlow/
├── finance_frontend/      # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # Shared UI and app components
│   ├── context/           # Auth context
│   ├── services/          # API client
│   └── lib/               # Utilities and dummy data
│
├── finance_backend/       # Django backend
│   ├── api/               # Finance API app
│   ├── finance_backend/   # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh
│   └── Procfile
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Python 3.10+
- pip

## Backend Setup

```bash
cd finance_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend runs at:

```text
http://127.0.0.1:8000
```

## Frontend Setup

Open a second terminal:

```bash
cd finance_frontend
pnpm install
pnpm dev
```

The frontend runs at:

```text
http://localhost:3000
```

For local development, the frontend defaults to:

```text
http://127.0.0.1:8000/api
```

## Environment Variables

### Frontend

Create `finance_frontend/.env.local` if you want to override the API URL:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://finflow-backend-wc4f.onrender.com
```

### Backend

Set these variables in production:

```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
CORS_ALLOWED_ORIGINS=https://finflow-main.onrender.com
DATABASE_URL=postgresql://username:password@host:5432/database
```

`DATABASE_URL` should be the Render PostgreSQL Internal Database URL when deploying on Render.

## API Overview

Main backend routes:

```text
POST /api/auth/register/
POST /api/auth/token/
POST /api/auth/token/refresh/
GET  /api/auth/profile/
PATCH /api/auth/profile/

GET/POST        /api/expenses/
GET/PATCH/DELETE /api/expenses/:id/

GET/POST        /api/subscriptions/
GET/PATCH/DELETE /api/subscriptions/:id/

GET/POST        /api/tax/
GET/PATCH/DELETE /api/tax/:id/

GET/POST        /api/habits/
GET/PATCH/DELETE /api/habits/:id/

GET /api/dashboard/
GET /api/insights/
```

## Render Deployment

### Backend

If the Render root directory is the repo root:

```bash
cd finance_backend && bash build.sh
```

Start command:

```bash
cd finance_backend && gunicorn finance_backend.wsgi:application
```

If the Render root directory is `finance_backend`:

```bash
bash build.sh
```

Start command:

```bash
gunicorn finance_backend.wsgi:application
```

The build script installs dependencies, collects static files, and runs migrations.

### Frontend

Build command:

```bash
pnpm install && pnpm build
```

Start command:

```bash
pnpm start
```

Set:

```env
NEXT_PUBLIC_API_URL=https://finflow-backend-wc4f.onrender.com
```

## Screens

- Register and login
- Dashboard
- Expense tracker
- Subscriptions
- Tax assistant
- Spending insights
- Habits
- Profile settings

## What I Learned

This project helped me practice:

- Building a full-stack app with Next.js and Django REST Framework
- JWT authentication across frontend and backend
- Connecting production frontend and backend services
- Handling CORS, environment variables, and deployment configuration
- Debugging Render deployment issues
- Designing dashboards and finance-focused user flows

## Author

Aryan Sharma  
GitHub: https://github.com/Aryan-1712

