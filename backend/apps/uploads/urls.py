from django.urls import path

from .views import ProcessedCSVRecordListAPIView, UploadCSVAPIView

urlpatterns = [
    path("upload-csv/", UploadCSVAPIView.as_view(), name="upload-csv"),
    path("processed-records/", ProcessedCSVRecordListAPIView.as_view(), name="processed-records"),
]

