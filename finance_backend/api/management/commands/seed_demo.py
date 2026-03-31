"""
Management command: python manage.py seed_demo
Creates a demo superuser and populates sample data for development.
"""
import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import Expense, Habit, Subscription, TaxRecord
from api.services.insights_engine import generate_insights


SAMPLE_EXPENSES = [
    ("Zomato dinner order", "food", 450),
    ("Swiggy lunch", "food", 320),
    ("BigBasket weekly groceries", "food", 1800),
    ("Uber to airport", "transport", 650),
    ("Monthly metro recharge", "transport", 500),
    ("Petrol fill-up", "transport", 2200),
    ("Netflix subscription", "entertainment", 649),
    ("Spotify Premium", "entertainment", 119),
    ("PVR movie tickets", "entertainment", 900),
    ("Electricity bill", "utilities", 1400),
    ("Jio postpaid recharge", "utilities", 299),
    ("Internet broadband", "utilities", 899),
    ("Apollo pharmacy", "health", 750),
    ("Gym membership", "health", 1200),
    ("Amazon order", "shopping", 2500),
    ("Myntra clothes", "shopping", 1800),
    ("Udemy course", "education", 499),
    ("Book purchase", "education", 350),
    ("OYO hotel stay", "travel", 3200),
    ("Groww SIP investment", "investment", 5000),
]

SAMPLE_SUBSCRIPTIONS = [
    ("Netflix", 649, "monthly"),
    ("Spotify", 119, "monthly"),
    ("Amazon Prime", 1499, "yearly"),
    ("Google One", 130, "monthly"),
    ("GitHub Pro", 84, "monthly"),
]

SAMPLE_TAX = [
    ("80C", 50000, "PPF contribution"),
    ("80C", 46800, "ELSS mutual fund SIP"),
    ("80D", 15000, "Health insurance premium"),
    ("80TTA", 4500, "Savings account interest"),
]

SAMPLE_HABITS = [
    ("Save ₹5000/month", 5000),
    ("Limit food spend to ₹3000", 3000),
    ("No impulse shopping > ₹500", 500),
]


class Command(BaseCommand):
    help = "Seed the database with demo data for development and testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username", default="demo", help="Demo superuser username (default: demo)"
        )
        parser.add_argument(
            "--password", default="demo1234", help="Demo superuser password (default: demo1234)"
        )

    def handle(self, *args, **options):
        username = options["username"]
        password = options["password"]

        # Create or retrieve demo user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": f"{username}@example.com",
                "first_name": "Demo",
                "last_name": "User",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}' / '{password}'"))
        else:
            self.stdout.write(f"Using existing user '{username}'")

        # Clear old data
        Expense.objects.filter(user=user).delete()
        Subscription.objects.filter(user=user).delete()
        TaxRecord.objects.filter(user=user).delete()
        Habit.objects.filter(user=user).delete()

        today = date.today()

        # Expenses — spread over last 3 months
        expenses = []
        for i, (desc, cat, amt) in enumerate(SAMPLE_EXPENSES):
            offset = random.randint(0, 89)
            exp_date = today - timedelta(days=offset)
            expenses.append(Expense(
                user=user,
                description=desc,
                category=cat,
                amount=Decimal(str(amt + random.randint(-50, 50))),
                date=exp_date,
                is_subscription=cat in ("entertainment", "subscription"),
            ))
        # Add some extra food entries this month to trigger the warning insight
        for _ in range(5):
            expenses.append(Expense(
                user=user,
                description="Zomato order",
                category="food",
                amount=Decimal(str(random.randint(300, 600))),
                date=today - timedelta(days=random.randint(0, 15)),
            ))
        Expense.objects.bulk_create(expenses)
        self.stdout.write(f"  Created {len(expenses)} expenses")

        # Subscriptions
        subs = []
        for name, amt, cycle in SAMPLE_SUBSCRIPTIONS:
            subs.append(Subscription(
                user=user,
                name=name,
                amount=Decimal(str(amt)),
                billing_cycle=cycle,
                next_payment_date=today + timedelta(days=random.randint(1, 30)),
                is_active=True,
            ))
        Subscription.objects.bulk_create(subs)
        self.stdout.write(f"  Created {len(subs)} subscriptions")

        # Tax records
        tax_records = []
        for cat, amt, desc in SAMPLE_TAX:
            tax_records.append(TaxRecord(
                user=user,
                category=cat,
                amount=Decimal(str(amt)),
                description=desc,
                financial_year="2024-25",
            ))
        TaxRecord.objects.bulk_create(tax_records)
        self.stdout.write(f"  Created {len(tax_records)} tax records")

        # Habits
        habits = []
        for name, target in SAMPLE_HABITS:
            habits.append(Habit(
                user=user,
                name=name,
                target_amount=Decimal(str(target)),
                progress=Decimal(str(random.randint(int(target * 0.4), target))),
                streak=random.randint(0, 7),
                last_checked=today - timedelta(days=random.randint(0, 2)),
            ))
        Habit.objects.bulk_create(habits)
        self.stdout.write(f"  Created {len(habits)} habits")

        # Insights
        count = generate_insights(user)
        self.stdout.write(f"  Generated {count} insights")

        self.stdout.write(self.style.SUCCESS("\n✅ Demo data seeded successfully!"))
        self.stdout.write(f"   Login: username='{username}'  password='{password}'")
        self.stdout.write("   Admin: http://127.0.0.1:8000/admin/")
