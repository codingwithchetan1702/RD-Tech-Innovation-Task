from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .celery_tasks import simulate_ten_second_task
from .models import Task


class TaskTriggerAPIView(APIView):
    """
    POST /api/tasks/
    Creates a Task row and triggers the 10-second Celery job.
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def post(self, request):
        task = Task.objects.create(status=Task.Status.PENDING)
        simulate_ten_second_task.delay(str(task.id))

        return Response({"task_id": str(task.id), "status": task.status}, status=status.HTTP_202_ACCEPTED)


class TaskDetailAPIView(APIView):
    """
    GET /api/tasks/<task_id>/
    Fetch task status/result for polling.
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def get(self, request, task_id: str):
        task = Task.objects.filter(id=task_id).first()
        if not task:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "task_id": str(task.id),
                "status": task.status,
                "result": task.result,
                "error": task.error,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }
        )
