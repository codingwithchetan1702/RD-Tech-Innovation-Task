from django.db import models


class ProcessedCSVRecord(models.Model):
    """
    Stores one parsed CSV row as JSON.
    """

    source_file_name = models.CharField(max_length=255)
    row_number = models.PositiveIntegerField()
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "uploads_processedcsvrecord"
        unique_together = ("source_file_name", "row_number")
        indexes = [
            models.Index(fields=["source_file_name", "row_number"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.source_file_name}#{self.row_number}"
