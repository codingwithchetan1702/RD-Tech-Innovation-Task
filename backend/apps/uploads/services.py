import datetime
import io
from typing import Optional

import pandas as pd
from django.db import transaction
from django.utils.timezone import now

from search.models import DataRecord

from .models import ProcessedCSVRecord


def _parse_date(value) -> datetime.date:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return now().date()
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return now().date()


def parse_csv_and_store(*, file_obj, source_file_name: str) -> int:
    """
    Parse uploaded CSV using pandas and store each row in the DB.

    Also attempts to map rows into search.DataRecord for /api/data/ searching.
    """

    # Read CSV via pandas (works with file-like objects).
    df = pd.read_csv(file_obj)

    records_to_create = []
    data_records_to_create = []

    today = now().date()
    for idx, row in df.iterrows():
        row_number = int(idx) + 1
        raw_dict = row.to_dict()
        # Convert pandas/numpy scalar values into plain Python types for JSONField.
        data_dict = {}
        for k, v in raw_dict.items():
            if pd.isna(v):
                data_dict[k] = None
            else:
                data_dict[k] = v.item() if hasattr(v, "item") else v

        records_to_create.append(
            ProcessedCSVRecord(
                source_file_name=source_file_name,
                row_number=row_number,
                data=data_dict,
            )
        )

        category = str(data_dict.get("category") or "general")
        name = str(data_dict.get("name") or f"row_{row_number}")

        value_raw = data_dict.get("value")
        try:
            value = None if value_raw is None or (isinstance(value_raw, float) and pd.isna(value_raw)) else value_raw
        except Exception:
            value = None

        record_date = _parse_date(data_dict.get("date", today))

        payload = data_dict

        data_records_to_create.append(
            DataRecord(
                category=category,
                name=name[:200],
                value=value,
                record_date=record_date,
                payload=payload,
                source_file_name=source_file_name,
                source_row_number=row_number,
            )
        )

    with transaction.atomic():
        ProcessedCSVRecord.objects.bulk_create(records_to_create)
        DataRecord.objects.bulk_create(data_records_to_create)

    return len(records_to_create)

