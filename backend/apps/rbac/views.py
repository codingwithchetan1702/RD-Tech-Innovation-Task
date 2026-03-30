from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Permission, Role
from .permissions import HasPermissionCodename
from .serializers import PermissionSerializer, RoleSerializer
from .services import assign_permissions_to_role, assign_roles_to_user, user_has_permission

User = get_user_model()


class PermissionViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for permissions.
    """

    serializer_class = PermissionSerializer
    queryset = Permission.objects.all().order_by("codename")
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated, HasPermissionCodename]
    required_permission = "rbac.manage_permissions"


class AssignRolesToUserView(APIView):
    """
    Assign roles to a user.
    POST /api/users/<user_id>/roles/
    body: { "role_ids": [1,2,3] }
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def post(self, request, user_id: int):
        user = get_object_or_404(User, id=user_id)
        role_ids = request.data.get("role_ids", [])
        if not isinstance(role_ids, list):
            return Response({"detail": "role_ids must be a list of integers."}, status=status.HTTP_400_BAD_REQUEST)

        assign_roles_to_user(user, role_ids)
        return Response({"user_id": user.id, "assigned_role_ids": list(user.roles.values_list("id", flat=True))})


class AssignPermissionsToRoleView(APIView):
    """
    Assign permissions to a role.
    POST /api/roles/<role_id>/permissions/
    body: { "permission_ids": [1,2,3] }
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def post(self, request, role_id: int):
        role = get_object_or_404(Role, id=role_id)
        permission_ids = request.data.get("permission_ids", [])
        if not isinstance(permission_ids, list):
            return Response(
                {"detail": "permission_ids must be a list of integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assign_permissions_to_role(role, permission_ids)
        return Response(
            {
                "role_id": role.id,
                "assigned_permission_ids": list(role.permissions.values_list("id", flat=True)),
            }
        )


class CheckPermissionAPIView(APIView):
    """
    GET /api/check-permission/?user_id=&permission=
    Returns: { "has_permission": true/false }

    Note: "permission" is interpreted as permission codename.
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get("user_id")
        permission_codename = request.query_params.get("permission")

        if not user_id or not permission_codename:
            return Response(
                {"detail": "Missing required query params: user_id, permission"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(User, id=user_id)
        return Response({"user_id": user.id, "permission": permission_codename, "has_permission": user_has_permission(user, permission_codename)})

