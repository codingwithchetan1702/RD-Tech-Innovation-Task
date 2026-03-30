from django.conf import settings
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.select_related("customer").prefetch_related("items").all()


class InvoiceRetrieveView(generics.RetrieveAPIView):
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return Invoice.objects.select_related("customer").prefetch_related("items").all()
