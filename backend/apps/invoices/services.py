from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable

from django.db import transaction

from .models import Customer, Invoice, InvoiceItem


def _money(v: Decimal) -> Decimal:
    return v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@transaction.atomic
def create_invoice(customer_data: dict, items_data: Iterable[dict], invoice_date):
    """
    Backend-authoritative invoice creation with totals/tax calculation.
    """

    customer, _ = Customer.objects.get_or_create(
        email=customer_data["email"],
        defaults={"name": customer_data["name"]},
    )

    TAX_RATE = Decimal("0.18")
    subtotal = Decimal("0")
    for item in items_data:
        subtotal += Decimal(item["quantity"]) * Decimal(item["price"])

    subtotal = _money(subtotal)
    tax_amount = _money(subtotal * TAX_RATE)
    total_amount = _money(subtotal + tax_amount)

    invoice = Invoice.objects.create(
        customer=customer,
        date=invoice_date,
        subtotal_amount=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
    )

    InvoiceItem.objects.bulk_create(
        [
            InvoiceItem(
                invoice=invoice,
                product_name=item["product_name"],
                quantity=item["quantity"],
                price=item["price"],
            )
            for item in items_data
        ]
    )

    return invoice

