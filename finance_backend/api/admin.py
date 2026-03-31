from django.contrib import admin
from .models import Expense, Subscription, TaxRecord, Habit, Insight


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("user", "amount", "category", "date", "is_subscription", "description")
    list_filter = ("category", "is_subscription", "date")
    search_fields = ("user__username", "description")
    date_hierarchy = "date"


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "amount", "billing_cycle", "next_payment_date", "is_active")
    list_filter = ("billing_cycle", "is_active")
    search_fields = ("user__username", "name")


@admin.register(TaxRecord)
class TaxRecordAdmin(admin.ModelAdmin):
    list_display = ("user", "category", "amount", "financial_year", "date_recorded")
    list_filter = ("category", "financial_year")
    search_fields = ("user__username",)


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "target_amount", "progress", "streak", "last_checked")
    search_fields = ("user__username", "name")


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "is_read", "created_at", "short_message")
    list_filter = ("type", "is_read")
    search_fields = ("user__username", "message")

    @admin.display(description="Message")
    def short_message(self, obj):
        return obj.message[:80]
