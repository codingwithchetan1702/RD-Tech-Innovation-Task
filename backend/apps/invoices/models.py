from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)

    class Meta:
        db_table = "invoices_customer"

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Invoice(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="invoices")
    date = models.DateField()

    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "invoices_invoice"
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"Invoice #{self.pk} ({self.customer.name})"


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)  # Unit price

    class Meta:
        db_table = "invoices_invoice_item"

    def __str__(self) -> str:
        return f"{self.product_name} x {self.quantity}"
