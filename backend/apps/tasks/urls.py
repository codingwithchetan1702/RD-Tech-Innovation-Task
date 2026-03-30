from django.urls import path

from .views import TaskDetailAPIView, TaskTriggerAPIView

urlpatterns = [
    path("tasks/", TaskTriggerAPIView.as_view(), name="task-trigger"),
    path("tasks/<uuid:task_id>/", TaskDetailAPIView.as_view(), name="task-detail"),
]

