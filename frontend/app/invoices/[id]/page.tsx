"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { apiGet, normalizeApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

type InvoiceDetail = {
  id: number;
  date: string;
  subtotal_amount: string;
  tax_amount: string;
  total_amount: string;
  customer: { name: string; email: string };
  items: { id: number; product_name: string; quantity: number; price: string }[];
};

export default function InvoiceDetailPage() {
  const params = useParams<{ id?: string }>();
  const invoiceId = params?.id;
  const [data, setData] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
      setLoading(false);
      setError("Invalid invoice id in URL. Please go back to the invoices list and open a valid invoice.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      setError("Missing JWT. Please sign in first.");
      return;
    }

    (async () => {
      try {
        const res = await apiGet<InvoiceDetail>(`/api/invoices/${invoiceId}/`);
        setData(res);
      } catch (e) {
        setError(normalizeApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId]);

  if (loading) return <LoadingState label="Loading invoice..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={error} />
        <div className="mt-4 text-sm">
          <a className="text-zinc-900 underline" href="/auth">
            Go to sign-in
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Invoice not found." description="Check the invoice ID and try again." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Invoice #{data.id}</h1>
        <Link href="/invoices" className="text-sm underline text-zinc-900">
          Back to list
        </Link>
      </div>

      <div className="mt-4 rounded-lg border bg-white p-4">
        <div className="text-sm text-zinc-600">Issued on {data.date}</div>
        <div className="mt-2">
          <div className="text-sm font-semibold text-zinc-900">{data.customer?.name}</div>
          <div className="text-sm text-zinc-600">{data.customer?.email}</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr className="border-b">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr key={it.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{it.product_name}</td>
                <td className="px-4 py-3 text-zinc-700">{it.quantity}</td>
                <td className="px-4 py-3 text-zinc-700">{it.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-600">Subtotal</div>
          <div className="mt-2 text-lg font-semibold text-zinc-900">{data.subtotal_amount}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-600">Tax (18%)</div>
          <div className="mt-2 text-lg font-semibold text-zinc-900">{data.tax_amount}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-600">Total</div>
          <div className="mt-2 text-lg font-semibold text-zinc-900">{data.total_amount}</div>
        </div>
      </div>
    </div>
  );
}

