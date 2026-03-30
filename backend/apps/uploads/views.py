from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProcessedCSVRecord
from .serializers import ProcessedCSVRecordSerializer
from .services import parse_csv_and_store


class UploadCSVAPIView(APIView):
    """
    POST /api/upload-csv/
    Multipart form: file=<csv>
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def post(self, request):
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response({"detail": "Missing 'file' upload."}, status=status.HTTP_400_BAD_REQUEST)

        filename = uploaded.name or "upload.csv"
        content_type = (uploaded.content_type or "").lower()
        is_csv_ext = filename.lower().endswith(".csv")
        is_csv_type = "csv" in content_type

        if not (is_csv_ext or is_csv_type):
            return Response({"detail": "Invalid file type. Please upload a .csv file."}, status=status.HTTP_400_BAD_REQUEST)

        count = parse_csv_and_store(file_obj=uploaded, source_file_name=filename)
        return Response({"source_file_name": filename, "rows_stored": count}, status=status.HTTP_201_CREATED)


class ProcessedCSVRecordListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    serializer_class = ProcessedCSVRecordSerializer
    queryset = ProcessedCSVRecord.objects.all().order_by("-created_at")
