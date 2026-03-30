from django.urls import path

from .views import DataRecordListAPIView

urlpatterns = [
    path("data/", DataRecordListAPIView.as_view(), name="data-record-list"),
]

