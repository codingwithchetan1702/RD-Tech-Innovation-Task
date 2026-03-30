from django.db.models import Q
from django.conf import settings
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import DataRecord
from .serializers import DataRecordSerializer


class DataRecordListAPIView(generics.ListAPIView):
    """
    GET /api/data/?search=&category=&start_date=&end_date=&page=
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    serializer_class = DataRecordSerializer
    queryset = DataRecord.objects.all().order_by("-record_date")

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        search = params.get("search")
        category = params.get("category")
        start_date = params.get("start_date")
        end_date = params.get("end_date")

        if category:
            qs = qs.filter(category=category)

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__icontains=search))

        if start_date:
            qs = qs.filter(record_date__gte=start_date)

        if end_date:
            qs = qs.filter(record_date__lte=end_date)

        return qs
