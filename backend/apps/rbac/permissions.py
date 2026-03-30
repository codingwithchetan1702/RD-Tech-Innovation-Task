from rest_framework.permissions import BasePermission

from .services import user_has_permission


class HasPermissionCodename(BasePermission):
    """
    Enforces that the authenticated user has the given permission codename.

    Usage:
      class MyView(APIView):
          permission_classes = [HasPermissionCodename]
          required_permission = "invoices.create_invoice"
    """

    def has_permission(self, request, view) -> bool:
        required = getattr(view, "required_permission", None)
        if not required:
            return True
        # Allow Django staff/superusers to bootstrap permissions.
        if getattr(request.user, "is_superuser", False) or getattr(request.user, "is_staff", False):
            return True
        return user_has_permission(request.user, required)

