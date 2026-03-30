from django.db import models


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    permissions = models.ManyToManyField(
        "rbac.Permission",
        related_name="roles",
        blank=True,
    )

    class Meta:
        db_table = "rbac_role"

    def __str__(self) -> str:
        return self.name


class Permission(models.Model):
    """
    Permission codename is the stable identifier used in permission checks.
    Example codename: "invoices.create_invoice"
    """

    name = models.CharField(max_length=200)
    codename = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "rbac_permission"
        indexes = [
            models.Index(fields=["codename"]),
        ]

    def __str__(self) -> str:
        return self.codename
