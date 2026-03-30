import uuid

from django.db import models


class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = "Pending", "Pending"
        PROCESSING = "Processing", "Processing"
        COMPLETED = "Completed", "Completed"
        FAILED = "Failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    result = models.JSONField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tasks_task"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Task({self.id}) - {self.status}"
