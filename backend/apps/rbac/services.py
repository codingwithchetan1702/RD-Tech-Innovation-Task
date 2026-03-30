from typing import Iterable

from django.contrib.auth import get_user_model

from .models import Permission, Role

User = get_user_model()


def user_has_permission(user: User, permission_codename: str) -> bool:
    """
    Core permission check:
    user -> roles -> permissions -> codename
    """

    if not user or not getattr(user, "is_authenticated", False):
        return False

    return user.roles.filter(permissions__codename=permission_codename).exists()


def assign_roles_to_user(user: User, role_ids: Iterable[int]) -> None:
    roles = Role.objects.filter(id__in=list(role_ids))
    user.roles.set(roles)


def assign_permissions_to_role(role: Role, permission_ids: Iterable[int]) -> None:
    perms = Permission.objects.filter(id__in=list(permission_ids))
    role.permissions.set(perms)

