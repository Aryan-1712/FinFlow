from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Expense, Subscription, TaxRecord, Habit, Insight


# ── Auth serializers ───────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "password2", "first_name", "last_name")
        read_only_fields = ("id",)

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")
        read_only_fields = ("id", "date_joined")


# ── Expense ────────────────────────────────────────────────────────────────────

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = (
            "id", "user", "amount", "category", "date",
            "description", "is_subscription", "created_at", "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


# ── Subscription ───────────────────────────────────────────────────────────────

class SubscriptionSerializer(serializers.ModelSerializer):
    monthly_equivalent = serializers.ReadOnlyField()

    class Meta:
        model = Subscription
        fields = (
            "id", "user", "name", "amount", "billing_cycle",
            "next_payment_date", "is_active", "monthly_equivalent",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "user", "monthly_equivalent", "created_at", "updated_at")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


# ── TaxRecord ──────────────────────────────────────────────────────────────────

class TaxRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRecord
        fields = (
            "id", "user", "category", "amount", "description",
            "financial_year", "date_recorded", "created_at",
        )
        read_only_fields = ("id", "user", "created_at")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


# ── Habit ──────────────────────────────────────────────────────────────────────

class HabitSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Habit
        fields = (
            "id", "user", "name", "target_amount", "progress",
            "streak", "last_checked", "completion_percentage",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "user", "completion_percentage", "created_at", "updated_at")

    def validate(self, data):
        if data.get("progress", 0) < 0:
            raise serializers.ValidationError({"progress": "Progress cannot be negative."})
        if data.get("target_amount", 1) <= 0:
            raise serializers.ValidationError({"target_amount": "Target amount must be greater than zero."})
        return data


# ── Insight ────────────────────────────────────────────────────────────────────

class InsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insight
        fields = ("id", "user", "message", "type", "is_read", "created_at")
        read_only_fields = ("id", "user", "created_at")
