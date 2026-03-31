from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# ── Expense ────────────────────────────────────────────────────────────────────

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ("food", "Food & Dining"),
        ("transport", "Transport"),
        ("entertainment", "Entertainment"),
        ("utilities", "Utilities"),
        ("health", "Health & Medical"),
        ("shopping", "Shopping"),
        ("education", "Education"),
        ("travel", "Travel"),
        ("subscription", "Subscription"),
        ("investment", "Investment"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expenses")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    date = models.DateField(default=timezone.now)
    description = models.TextField(blank=True, default="")
    is_subscription = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user.username} | {self.category} | ₹{self.amount} | {self.date}"


# ── Subscription ───────────────────────────────────────────────────────────────

class Subscription(models.Model):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("weekly", "Weekly"),
        ("quarterly", "Quarterly"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    name = models.CharField(max_length=150)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default="monthly")
    next_payment_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["next_payment_date"]

    def __str__(self):
        return f"{self.user.username} | {self.name} | ₹{self.amount}/{self.billing_cycle}"

    @property
    def monthly_equivalent(self):
        """Normalise any cycle to a monthly cost."""
        mapping = {"weekly": 4.33, "monthly": 1, "quarterly": 1 / 3, "yearly": 1 / 12}
        return float(self.amount) * mapping.get(self.billing_cycle, 1)


# ── TaxRecord ──────────────────────────────────────────────────────────────────

class TaxRecord(models.Model):
    CATEGORY_CHOICES = [
        ("80C", "Section 80C (Investments)"),
        ("80D", "Section 80D (Health Insurance)"),
        ("80E", "Section 80E (Education Loan)"),
        ("80G", "Section 80G (Donations)"),
        ("80TTA", "Section 80TTA (Savings Interest)"),
        ("HRA", "House Rent Allowance"),
        ("LTA", "Leave Travel Allowance"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tax_records")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(blank=True, default="")
    financial_year = models.CharField(
        max_length=10,
        default="2024-25",
        help_text="E.g. 2024-25",
    )
    date_recorded = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_recorded"]

    def __str__(self):
        return f"{self.user.username} | {self.category} | ₹{self.amount}"


# ── Habit ──────────────────────────────────────────────────────────────────────

class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="habits")
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        help_text="Monthly savings / spending target in ₹",
    )
    progress = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    streak = models.PositiveIntegerField(default=0, help_text="Consecutive days/months goal met")
    last_checked = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-streak", "name"]

    def __str__(self):
        return f"{self.user.username} | {self.name} | streak={self.streak}"

    @property
    def completion_percentage(self):
        if self.target_amount == 0:
            return 0
        return min(round((float(self.progress) / float(self.target_amount)) * 100, 1), 100)


# ── Insight ────────────────────────────────────────────────────────────────────

class Insight(models.Model):
    TYPE_CHOICES = [
        ("warning", "Warning"),
        ("suggestion", "Suggestion"),
        ("info", "Info"),
        ("achievement", "Achievement"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="insights")
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.type}] {self.user.username}: {self.message[:60]}"
