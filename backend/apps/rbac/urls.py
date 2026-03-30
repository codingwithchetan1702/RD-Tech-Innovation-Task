from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AssignPermissionsToRoleView,
    AssignRolesToUserView,
    CheckPermissionAPIView,
    PermissionViewSet,
)

router = DefaultRouter()
router.register(r"permissions", PermissionViewSet, basename="permissions")

urlpatterns = [
    path("", include(router.urls)),
    path("users/<int:user_id>/roles/", AssignRolesToUserView.as_view(), name="assign-roles-to-user"),
    path("roles/<int:role_id>/permissions/", AssignPermissionsToRoleView.as_view(), name="assign-permissions-to-role"),
    path("check-permission/", CheckPermissionAPIView.as_view(), name="check-permission"),
]

