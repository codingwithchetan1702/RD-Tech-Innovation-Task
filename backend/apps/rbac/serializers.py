from rest_framework import serializers

from .models import Permission, Role


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "name", "codename", "description"]


class RoleSerializer(serializers.ModelSerializer):
    permission_codenames = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Role
        fields = ["id", "name", "description", "permission_codenames"]

    def create(self, validated_data):
        validated_data.pop("permission_codenames", None)
        return super().create(validated_data)

