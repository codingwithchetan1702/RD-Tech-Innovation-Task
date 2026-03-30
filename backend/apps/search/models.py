from django.db import models


class DataRecord(models.Model):
    """
    Generic searchable record. CSV uploads will attempt to map rows into this model.
    """

    category = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=200, db_index=True)

    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    record_date = models.DateField(db_index=True)

    payload = models.JSONField(blank=True, null=True)

    source_file_name = models.CharField(max_length=255, blank=True, null=True)
    source_row_number = models.PositiveIntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "search_datarecord"
        indexes = [
            models.Index(fields=["category", "record_date"]),
        ]
        ordering = ["-record_date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.category}: {self.name}"
