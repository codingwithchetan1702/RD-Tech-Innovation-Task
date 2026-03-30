from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model to support RBAC via roles.
    """

    roles = models.ManyToManyField(
        "rbac.Role",
        related_name="users",
        blank=True,
    )
