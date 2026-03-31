from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChangePasswordView,
    DashboardView,
    ExpenseViewSet,
    HabitViewSet,
    InsightViewSet,
    ProfileView,
    RegisterView,
    SubscriptionViewSet,
    TaxRecordViewSet,
)

router = DefaultRouter()
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")
router.register(r"tax", TaxRecordViewSet, basename="tax")
router.register(r"habits", HabitViewSet, basename="habit")
router.register(r"insights", InsightViewSet, basename="insight")

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),

    # Dashboard
    path("dashboard/", DashboardView.as_view(), name="dashboard"),

    # Resource routes
    path("", include(router.urls)),
]
