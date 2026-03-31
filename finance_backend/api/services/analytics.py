"""
Spending analytics and financial health score engine.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.contrib.auth.models import User


# ── Helper ─────────────────────────────────────────────────────────────────────

def _to_float(value) -> float:
    return float(value) if value is not None else 0.0


# ── Expense analytics ──────────────────────────────────────────────────────────

def monthly_totals(user: "User", months: int = 6) -> list[dict]:
    """Return total spending per calendar month for the last N months."""
    from api.models import Expense

    today = date.today()
    results = []
    for delta in range(months - 1, -1, -1):
        # Compute first day of target month
        first = (today.replace(day=1) - timedelta(days=delta * 28)).replace(day=1)
        if first.month == 12:
            last = first.replace(day=31)
        else:
            last = first.replace(month=first.month + 1) - timedelta(days=1)

        expenses = Expense.objects.filter(user=user, date__gte=first, date__lte=last)
        total = sum(_to_float(e.amount) for e in expenses)
        results.append({
            "month": first.strftime("%b %Y"),
            "year": first.year,
            "month_num": first.month,
            "total": round(total, 2),
        })
    return results


def category_breakdown(user: "User", month: date | None = None) -> dict[str, float]:
    """Return {category: total_amount} for a given month (default: current)."""
    from api.models import Expense

    if month is None:
        month = date.today()
    first = month.replace(day=1)
    if first.month == 12:
        last = first.replace(day=31)
    else:
        last = first.replace(month=first.month + 1) - timedelta(days=1)

    expenses = Expense.objects.filter(user=user, date__gte=first, date__lte=last)
    totals: dict[str, float] = defaultdict(float)
    for e in expenses:
        totals[e.category] += _to_float(e.amount)
    return {k: round(v, 2) for k, v in totals.items()}


def category_percentages(user: "User", month: date | None = None) -> dict[str, float]:
    breakdown = category_breakdown(user, month)
    grand_total = sum(breakdown.values())
    if grand_total == 0:
        return {}
    return {cat: round((amt / grand_total) * 100, 1) for cat, amt in breakdown.items()}


def weekend_vs_weekday(user: "User", month: date | None = None) -> dict:
    """Split spending into weekend (Sat-Sun) vs weekday."""
    from api.models import Expense

    if month is None:
        month = date.today()
    first = month.replace(day=1)
    if first.month == 12:
        last = first.replace(day=31)
    else:
        last = first.replace(month=first.month + 1) - timedelta(days=1)

    weekend = 0.0
    weekday = 0.0
    for e in Expense.objects.filter(user=user, date__gte=first, date__lte=last):
        if e.date.weekday() >= 5:  # Saturday=5, Sunday=6
            weekend += _to_float(e.amount)
        else:
            weekday += _to_float(e.amount)

    total = weekend + weekday
    return {
        "weekend": round(weekend, 2),
        "weekday": round(weekday, 2),
        "weekend_pct": round((weekend / total * 100) if total else 0, 1),
        "weekday_pct": round((weekday / total * 100) if total else 0, 1),
    }


# ── Financial Health Score ─────────────────────────────────────────────────────

def financial_health_score(user: "User") -> dict:
    """
    Compute a 0–100 score based on:
      - Savings ratio          (weight 40)
      - Subscription load      (weight 30)
      - Unnecessary spending   (weight 30)
    """
    from api.models import Expense, Subscription

    today = date.today()
    first = today.replace(day=1)
    if first.month == 12:
        last = first.replace(day=31)
    else:
        last = first.replace(month=first.month + 1) - timedelta(days=1)

    monthly_expenses = Expense.objects.filter(user=user, date__gte=first, date__lte=last)
    total_spending = sum(_to_float(e.amount) for e in monthly_expenses)

    # ── Subscription load ──────────────────────────────────────────────────────
    active_subs = Subscription.objects.filter(user=user, is_active=True)
    monthly_sub_cost = sum(s.monthly_equivalent for s in active_subs)

    sub_ratio = (monthly_sub_cost / total_spending) if total_spending > 0 else 0
    # Penalty: >20% of spending on subs = 0 points, 0% = 30 points
    sub_score = max(0, 30 - (sub_ratio * 150))

    # ── Unnecessary spending (entertainment + shopping) ────────────────────────
    unnecessary_cats = {"entertainment", "shopping"}
    unnecessary = sum(
        _to_float(e.amount) for e in monthly_expenses if e.category in unnecessary_cats
    )
    unnec_ratio = (unnecessary / total_spending) if total_spending > 0 else 0
    # Penalty: >40% = 0 points, 0% = 30 points
    unnec_score = max(0, 30 - (unnec_ratio * 75))

    # ── Savings ratio (estimated; we don't store income, so we use a benchmark) ─
    # Assume a healthy month has total_spending < 70% of last-month's spending
    monthly_data = monthly_totals(user, months=2)
    if len(monthly_data) >= 2 and monthly_data[-2]["total"] > 0:
        prev_total = monthly_data[-2]["total"]
        savings_ratio = max(0, 1 - (total_spending / (prev_total * 1.1)))
    else:
        savings_ratio = 0.5  # neutral when no history

    savings_score = min(40, savings_ratio * 40)

    total_score = round(savings_score + sub_score + unnec_score)

    grade = (
        "Excellent" if total_score >= 80
        else "Good" if total_score >= 60
        else "Fair" if total_score >= 40
        else "Needs Attention"
    )

    return {
        "score": total_score,
        "grade": grade,
        "breakdown": {
            "savings_score": round(savings_score, 1),
            "subscription_score": round(sub_score, 1),
            "spending_score": round(unnec_score, 1),
        },
        "monthly_spending": round(total_spending, 2),
        "monthly_subscription_cost": round(monthly_sub_cost, 2),
    }
