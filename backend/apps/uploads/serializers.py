from rest_framework import serializers

from .models import ProcessedCSVRecord


class ProcessedCSVRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessedCSVRecord
        fields = ["id", "source_file_name", "row_number", "data", "created_at"]
