from django.urls import path

from .views import InvoiceListCreateView, InvoiceRetrieveView

urlpatterns = [
    path("invoices/", InvoiceListCreateView.as_view(), name="invoice-list-create"),
    path("invoices/<int:pk>/", InvoiceRetrieveView.as_view(), name="invoice-detail"),
]

