"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiPost, normalizeApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import ErrorState from "@/components/ErrorState";

type LineItemDraft = { product_name: string; quantity: number; price: number };
type CreatedInvoiceResponse = {
  id?: number | string;
  pk?: number | string;
};

export default function NewInvoicePage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  const [items, setItems] = useState<LineItemDraft[]>([
    { product_name: "", quantity: 1, price: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasToken(!!getAccessToken());
  }, []);

  if (hasToken === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-zinc-600">Checking authentication…</p>
      </div>
    );
  }

  if (!hasToken) {
    // Minimal guard without extra UI components.
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorState error="Missing JWT. Please sign in first." />
        <div className="mt-4 text-sm">
          <a className="text-zinc-900 underline" href="/auth">
            Go to sign-in
          </a>
        </div>
      </div>
    );
  }

  function updateItem(idx: number, patch: Partial<LineItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { product_name: "", quantity: 1, price: 0 }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        date,
        customer: { name: customerName, email: customerEmail },
        items: items.map((it) => ({
          product_name: it.product_name,
          quantity: it.quantity,
          price: it.price,
        })),
      };

      const created = await apiPost<CreatedInvoiceResponse>("/api/invoices/", payload);
      const rawId = created?.id ?? created?.pk;
      const invoiceId = typeof rawId === "string" ? Number(rawId) : rawId;

      if (!invoiceId || !Number.isFinite(Number(invoiceId))) {
        setError(
          `Invoice created, but no valid id returned by API. Response was: ${JSON.stringify(created)}`
        );
        return;
      }

      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900">Create Invoice</h1>
      <form className="mt-4 space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-800">Customer Name</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">Customer Email</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              type="email"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-800">Invoice Date</label>
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            required
          />
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-zinc-900">Line Items</div>
            <button
              type="button"
              onClick={addItem}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Add item
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="grid gap-3 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-6">
                  <label className="text-xs font-medium text-zinc-600">Product Name</label>
                  <input
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    value={it.product_name}
                    onChange={(e) => updateItem(idx, { product_name: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-zinc-600">Qty</label>
                  <input
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-medium text-zinc-600">Unit Price</label>
                  <input
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    type="number"
                    step="0.01"
                    min={0}
                    value={it.price}
                    onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    className="mt-1 w-full rounded-md border px-2 py-2 text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? <ErrorState error={error} /> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Invoice"}
        </button>
      </form>
    </div>
  );
}

