"""
Rule-based AI Insights Engine.

Generates Insight objects by evaluating a user's financial data against
a set of configurable rules.  New rules can be added by extending RULES.
"""
from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


def _to_float(v) -> float:
    return float(v) if v is not None else 0.0


def _get_current_month_range() -> tuple[date, date]:
    today = date.today()
    first = today.replace(day=1)
    if first.month == 12:
        last = first.replace(day=31)
    else:
        last = first.replace(month=first.month + 1) - timedelta(days=1)
    return first, last


# ── Rule definitions ───────────────────────────────────────────────────────────
# Each rule is a callable: (user) -> list[dict{message, type}]

def _rule_food_overspend(user):
    from api.models import Expense
    first, last = _get_current_month_range()
    expenses = list(Expense.objects.filter(user=user, date__gte=first, date__lte=last))
    total = sum(_to_float(e.amount) for e in expenses)
    food_total = sum(_to_float(e.amount) for e in expenses if e.category == "food")
    if total > 0 and (food_total / total) > 0.30:
        pct = round(food_total / total * 100, 1)
        return [{
            "message": (
                f"Your food & dining expenses this month are {pct}% of total spending "
                f"(₹{food_total:,.0f}). Consider meal-prepping or cooking at home to reduce costs."
            ),
            "type": "warning",
        }]
    return []


def _rule_subscription_overload(user):
    from api.models import Expense, Subscription
    first, last = _get_current_month_range()
    expenses = list(Expense.objects.filter(user=user, date__gte=first, date__lte=last))
    total = sum(_to_float(e.amount) for e in expenses)

    active_subs = list(Subscription.objects.filter(user=user, is_active=True))
    monthly_sub = sum(s.monthly_equivalent for s in active_subs)

    results = []
    if total > 0 and (monthly_sub / total) > 0.15:
        pct = round(monthly_sub / total * 100, 1)
        results.append({
            "message": (
                f"Subscriptions account for {pct}% of your monthly spending (₹{monthly_sub:,.0f}/month). "
                f"Review and cancel services you rarely use."
            ),
            "type": "suggestion",
        })
    if len(active_subs) > 5:
        results.append({
            "message": (
                f"You have {len(active_subs)} active subscriptions. "
                "Consider auditing them — unused subscriptions can silently drain your budget."
            ),
            "type": "suggestion",
        })
    return results


def _rule_entertainment_overspend(user):
    from api.models import Expense
    first, last = _get_current_month_range()
    expenses = list(Expense.objects.filter(user=user, date__gte=first, date__lte=last))
    total = sum(_to_float(e.amount) for e in expenses)
    ent = sum(_to_float(e.amount) for e in expenses if e.category == "entertainment")
    if total > 0 and (ent / total) > 0.20:
        return [{
            "message": (
                f"Entertainment spending is {round(ent/total*100,1)}% of your budget this month. "
                "Try setting a monthly entertainment cap."
            ),
            "type": "warning",
        }]
    return []


def _rule_upcoming_subscription_payment(user):
    from api.models import Subscription
    today = date.today()
    soon = today + timedelta(days=3)
    upcoming = Subscription.objects.filter(
        user=user, is_active=True,
        next_payment_date__gte=today,
        next_payment_date__lte=soon,
    )
    results = []
    for sub in upcoming:
        results.append({
            "message": (
                f"Upcoming payment: {sub.name} — ₹{sub.amount} due on {sub.next_payment_date}."
            ),
            "type": "info",
        })
    return results


def _rule_spending_spike(user):
    """Warn if this month's spending is >30% higher than last month's."""
    from api.services.analytics import monthly_totals
    data = monthly_totals(user, months=2)
    if len(data) < 2:
        return []
    prev, curr = data[0]["total"], data[1]["total"]
    if prev > 0 and (curr - prev) / prev > 0.30:
        increase = round((curr - prev) / prev * 100, 1)
        return [{
            "message": (
                f"Your spending this month (₹{curr:,.0f}) is {increase}% higher than last month "
                f"(₹{prev:,.0f}). Review recent transactions for unusual charges."
            ),
            "type": "warning",
        }]
    return []


def _rule_positive_low_spend(user):
    """Positive reinforcement when spending is down."""
    from api.services.analytics import monthly_totals
    data = monthly_totals(user, months=2)
    if len(data) < 2:
        return []
    prev, curr = data[0]["total"], data[1]["total"]
    if prev > 0 and curr < prev * 0.85:
        saving = round(prev - curr, 2)
        return [{
            "message": (
                f"Great job! You spent ₹{saving:,.0f} less this month compared to last month. "
                "Keep it up!"
            ),
            "type": "achievement",
        }]
    return []


def _rule_high_shopping(user):
    from api.models import Expense
    first, last = _get_current_month_range()
    expenses = list(Expense.objects.filter(user=user, date__gte=first, date__lte=last))
    total = sum(_to_float(e.amount) for e in expenses)
    shopping = sum(_to_float(e.amount) for e in expenses if e.category == "shopping")
    if total > 0 and (shopping / total) > 0.25:
        return [{
            "message": (
                f"Shopping expenses are {round(shopping/total*100,1)}% of your monthly spending. "
                "Adopting a 24-hour rule before online purchases can help curb impulse buying."
            ),
            "type": "suggestion",
        }]
    return []


# Ordered list of all rules
RULES = [
    _rule_food_overspend,
    _rule_subscription_overload,
    _rule_entertainment_overspend,
    _rule_upcoming_subscription_payment,
    _rule_spending_spike,
    _rule_positive_low_spend,
    _rule_high_shopping,
]


# ── Public API ─────────────────────────────────────────────────────────────────

def generate_insights(user: "User", purge_old: bool = True) -> int:
    """
    Run all rules, persist new Insight records, and return count of new insights.
    Pass purge_old=True to clear existing unread insights before regenerating.
    """
    from api.models import Insight

    if purge_old:
        Insight.objects.filter(user=user, is_read=False).delete()

    new_insights = []
    for rule in RULES:
        try:
            results = rule(user)
            for r in results:
                new_insights.append(Insight(user=user, message=r["message"], type=r["type"]))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Insight rule %s failed for user %s: %s", rule.__name__, user.id, exc)

    Insight.objects.bulk_create(new_insights)
    return len(new_insights)
