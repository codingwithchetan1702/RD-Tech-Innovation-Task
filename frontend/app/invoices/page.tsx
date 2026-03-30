"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { apiGet, normalizeApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

type Invoice = {
  id: number;
  date: string;
  subtotal_amount: string;
  tax_amount: string;
  total_amount: string;
  customer: { name: string; email: string };
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page") ?? "1");
  const [page, setPage] = useState(initialPage);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      setError("Missing JWT. Please sign in first.");
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGet<Paginated<Invoice>>(`/api/invoices/?page=${page}`);
        setInvoices(res.results);
        setCount(res.count);
      } catch (e) {
        setError(normalizeApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / 10)), [count]);

  if (loading) return <LoadingState label="Loading invoices..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <ErrorState error={error} />
        <div className="mt-4 text-sm">
          <a className="text-zinc-900 underline" href="/auth">
            Go to sign-in
          </a>
        </div>
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="No invoices found." description="Create your first invoice to see it here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">Invoices</h1>
        <Link href="/invoices/new" className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white">
          Create invoice
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50">
            <tr className="border-b">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium text-zinc-900">#{inv.id}</td>
                <td className="px-4 py-3 text-zinc-700">{inv.date}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">{inv.customer?.name}</div>
                  <div className="text-xs text-zinc-600">{inv.customer?.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-zinc-900">{inv.total_amount}</td>
                <td className="px-4 py-3">
                  <Link className="text-zinc-900 underline" href={`/invoices/${inv.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <div className="text-sm text-zinc-600">
          Page {page} of {totalPages}
        </div>
        <button
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

