from rest_framework import serializers

from .models import Customer, Invoice, InvoiceItem
from .services import create_invoice


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["id", "product_name", "quantity", "price"]
        read_only_fields = ["id"]


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    customer = serializers.DictField(write_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "date",
            "subtotal_amount",
            "tax_amount",
            "total_amount",
            "customer",
            "items",
        ]
        read_only_fields = ["subtotal_amount", "tax_amount", "total_amount"]

    def validate(self, attrs):
        customer = attrs.get("customer") or {}
        if "name" not in customer or "email" not in customer:
            raise serializers.ValidationError({"customer": "Both 'name' and 'email' are required."})

        items = attrs.get("items") or []
        if not items:
            raise serializers.ValidationError({"items": "At least one line item is required."})

        for item in items:
            if item["quantity"] <= 0:
                raise serializers.ValidationError({"quantity": "Quantity must be > 0."})
            if item["price"] < 0:
                raise serializers.ValidationError({"price": "Price must be >= 0."})

        return attrs

    def create(self, validated_data):
        customer_data = validated_data.pop("customer")
        items_data = validated_data.pop("items")
        invoice_date = validated_data["date"]
        return create_invoice(customer_data=customer_data, items_data=items_data, invoice_date=invoice_date)

    def to_representation(self, instance):
        """
        Add expanded customer info and items for read responses.
        """

        rep = super().to_representation(instance)
        rep["customer"] = {
            "name": instance.customer.name,
            "email": instance.customer.email,
        }
        rep["items"] = InvoiceItemSerializer(instance.items.all(), many=True).data
        return rep
