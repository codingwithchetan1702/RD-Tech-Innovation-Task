import time

from celery import shared_task
from django.db import transaction

from .models import Task


@shared_task(bind=True)
def simulate_ten_second_task(self, task_id: str) -> dict:
    """
    Simulate a 10-second background job and update Task lifecycle.
    """

    try:
        task = Task.objects.get(id=task_id)

        with transaction.atomic():
            task.status = Task.Status.PROCESSING
            task.error = None
            task.save(update_fields=["status", "error", "updated_at"])

        time.sleep(10)

        result = {
            "message": "Background task completed.",
            "duration_seconds": 10,
        }

        with transaction.atomic():
            task.status = Task.Status.COMPLETED
            task.result = result
            task.error = None
            task.save(update_fields=["status", "result", "error", "updated_at"])

        return result
    except Exception as exc:
        # Best-effort status update.
        try:
            Task.objects.filter(id=task_id).update(
                status=Task.Status.FAILED,
                error=str(exc),
            )
        except Exception:
            pass
        raise

