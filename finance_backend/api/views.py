from datetime import date

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Expense, Habit, Insight, Subscription, TaxRecord
from .serializers import (
    ExpenseSerializer,
    HabitSerializer,
    InsightSerializer,
    RegisterSerializer,
    SubscriptionSerializer,
    TaxRecordSerializer,
    UserSerializer,
)
from .services.analytics import (
    category_breakdown,
    category_percentages,
    financial_health_score,
    monthly_totals,
    weekend_vs_weekday,
)
from .services.categorizer import auto_categorise, detect_subscription
from .services.insights_engine import generate_insights


# ── Auth views ─────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new user account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — current user's profile."""
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ — change the current user's password."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"error": "Both old_password and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.check_password(old_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully."})


# ── Expense ViewSet ────────────────────────────────────────────────────────────

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    /api/expenses/         — list, create
    /api/expenses/{id}/    — retrieve, update, partial_update, destroy
    /api/expenses/analysis/ — GET spending analysis for current month
    """
    serializer_class = ExpenseSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        # Optional filters
        category = self.request.query_params.get("category")
        start = self.request.query_params.get("start_date")
        end = self.request.query_params.get("end_date")
        is_sub = self.request.query_params.get("is_subscription")
        if category:
            qs = qs.filter(category=category)
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        if is_sub is not None:
            qs = qs.filter(is_subscription=is_sub.lower() == "true")
        return qs

    def perform_create(self, serializer):
        description = serializer.validated_data.get("description", "")
        category = serializer.validated_data.get("category", "other")

        # Auto-categorise if category is left as default
        if category == "other" and description:
            category = auto_categorise(description)

        is_subscription = detect_subscription(description, category)

        serializer.save(
            user=self.request.user,
            category=category,
            is_subscription=is_subscription,
        )

    @action(detail=False, methods=["get"])
    def analysis(self, request):
        """Return spending analysis for the current or a specified month."""
        month_param = request.query_params.get("month")  # format: YYYY-MM
        if month_param:
            try:
                year, month = map(int, month_param.split("-"))
                target_month = date(year, month, 1)
            except (ValueError, TypeError):
                return Response({"error": "Invalid month format. Use YYYY-MM."}, status=400)
        else:
            target_month = date.today()

        return Response({
            "category_breakdown": category_breakdown(request.user, target_month),
            "category_percentages": category_percentages(request.user, target_month),
            "weekend_vs_weekday": weekend_vs_weekday(request.user, target_month),
            "monthly_totals": monthly_totals(request.user, months=6),
        })


# ── Subscription ViewSet ───────────────────────────────────────────────────────

class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    /api/subscriptions/         — list, create
    /api/subscriptions/{id}/    — retrieve, update, partial_update, destroy
    /api/subscriptions/summary/ — GET aggregated monthly/yearly cost
    """
    serializer_class = SubscriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Subscription.objects.filter(user=self.request.user)
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        active = Subscription.objects.filter(user=request.user, is_active=True)
        monthly_total = sum(s.monthly_equivalent for s in active)
        return Response({
            "active_count": active.count(),
            "monthly_total": round(monthly_total, 2),
            "yearly_total": round(monthly_total * 12, 2),
        })


# ── TaxRecord ViewSet ──────────────────────────────────────────────────────────

class TaxRecordViewSet(viewsets.ModelViewSet):
    """
    /api/tax/         — list, create
    /api/tax/{id}/    — retrieve, update, partial_update, destroy
    /api/tax/summary/ — GET category-wise tax summary
    """
    serializer_class = TaxRecordSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = TaxRecord.objects.filter(user=self.request.user)
        fy = self.request.query_params.get("financial_year")
        category = self.request.query_params.get("category")
        if fy:
            qs = qs.filter(financial_year=fy)
        if category:
            qs = qs.filter(category=category)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        fy = request.query_params.get("financial_year")
        qs = TaxRecord.objects.filter(user=request.user)
        if fy:
            qs = qs.filter(financial_year=fy)

        from collections import defaultdict
        by_category: dict[str, float] = defaultdict(float)
        for record in qs:
            by_category[record.category] += float(record.amount)

        return Response({
            "financial_year": fy or "all",
            "by_category": dict(by_category),
            "total": round(sum(by_category.values()), 2),
        })


# ── Habit ViewSet ──────────────────────────────────────────────────────────────

class HabitViewSet(viewsets.ModelViewSet):
    """
    /api/habits/              — list, create
    /api/habits/{id}/         — retrieve, update, partial_update, destroy
    /api/habits/{id}/progress/ — PATCH update progress & recalc streak
    """
    serializer_class = HabitSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def progress(self, request, pk=None):
        """Update progress; auto-increment streak if target met."""
        habit = self.get_object()
        new_progress = request.data.get("progress")
        if new_progress is None:
            return Response({"error": "progress field is required."}, status=400)
        try:
            new_progress = float(new_progress)
        except ValueError:
            return Response({"error": "progress must be a number."}, status=400)

        habit.progress = new_progress
        today = date.today()

        # Increment streak if target reached and not already checked today
        if new_progress >= float(habit.target_amount):
            if habit.last_checked != today:
                habit.streak += 1
                habit.last_checked = today
        else:
            # Reset streak if target missed for >1 day
            if habit.last_checked and (today - habit.last_checked).days > 1:
                habit.streak = 0

        habit.save()
        return Response(HabitSerializer(habit).data)


# ── Insight ViewSet ────────────────────────────────────────────────────────────

class InsightViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    /api/insights/             — list
    /api/insights/{id}/        — retrieve, update (mark as read), destroy
    /api/insights/generate/    — POST trigger insight regeneration
    """
    serializer_class = InsightSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Insight.objects.filter(user=self.request.user)
        insight_type = self.request.query_params.get("type")
        is_read = self.request.query_params.get("is_read")
        if insight_type:
            qs = qs.filter(type=insight_type)
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() == "true")
        return qs

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """Trigger the AI insights engine for the current user."""
        count = generate_insights(request.user)
        insights = Insight.objects.filter(user=request.user, is_read=False)
        return Response({
            "generated": count,
            "insights": InsightSerializer(insights, many=True).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        return Response(InsightSerializer(insight).data)


# ── Dashboard View ─────────────────────────────────────────────────────────────

class DashboardView(APIView):
    """
    GET /api/dashboard/
    Returns a consolidated snapshot of the user's financial state.
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        today = date.today()

        # Regenerate insights on each dashboard load
        generate_insights(user)

        # Current month expenses
        first = today.replace(day=1)
        from datetime import timedelta
        if first.month == 12:
            last = first.replace(day=31)
        else:
            last = first.replace(month=first.month + 1) - timedelta(days=1)

        from .models import Expense, Subscription, Insight as InsightModel
        monthly_expenses = Expense.objects.filter(user=user, date__gte=first, date__lte=last)
        total_expenses = sum(float(e.amount) for e in monthly_expenses)

        active_subs = Subscription.objects.filter(user=user, is_active=True)
        sub_monthly = sum(s.monthly_equivalent for s in active_subs)

        recent_insights = InsightModel.objects.filter(user=user, is_read=False)[:5]

        health = financial_health_score(user)

        return Response({
            "summary": {
                "total_expenses_this_month": round(total_expenses, 2),
                "subscription_total_monthly": round(sub_monthly, 2),
                "active_subscriptions": active_subs.count(),
                "unread_insights": recent_insights.count(),
            },
            "category_breakdown": category_breakdown(user, today),
            "category_percentages": category_percentages(user, today),
            "monthly_trend": monthly_totals(user, months=6),
            "weekend_vs_weekday": weekend_vs_weekday(user, today),
            "financial_health": health,
            "recent_insights": InsightSerializer(recent_insights, many=True).data,
        })
