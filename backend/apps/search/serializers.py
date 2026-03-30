from rest_framework import serializers

from .models import DataRecord


class DataRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataRecord
        fields = [
            "id",
            "category",
            "name",
            "value",
            "record_date",
            "payload",
            "source_file_name",
            "source_row_number",
            "created_at",
        ]
