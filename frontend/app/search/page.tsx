"use client";

import { useEffect, useMemo, useState } from "react";

import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { apiGet, normalizeApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type DataRecord = {
  id: number;
  category: string;
  name: string;
  value: string | null;
  record_date: string;
  created_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function SearchPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<DataRecord[]>([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState({
    search: "",
    category: "",
    start_date: "",
    end_date: "",
  });
  const [filters, setFilters] = useState(draft);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      setError("Missing JWT. Please sign in first.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.category) params.set("category", filters.category);
        if (filters.start_date) params.set("start_date", filters.start_date);
        if (filters.end_date) params.set("end_date", filters.end_date);
        params.set("page", String(page));

        const res = await apiGet<Paginated<DataRecord>>(`/api/data/?${params.toString()}`);
        setRows(res.results);
        setCount(res.count);
      } catch (e) {
        setError(normalizeApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [page, filters]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / 10)), [count]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900">Search & Filter</h1>

      <form
        className="mt-4 rounded-lg border bg-white p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setFilters(draft);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-800">Keyword</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={draft.search}
              onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
              placeholder="Search name/category..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">Category</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              placeholder="e.g. general"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">Start Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={draft.start_date}
              onChange={(e) => setDraft((d) => ({ ...d, start_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-800">End Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              value={draft.end_date}
              onChange={(e) => setDraft((d) => ({ ...d, end_date: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-zinc-600">Total: {count}</div>
          <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white" type="submit">
            Search
          </button>
        </div>

        {error ? <div className="mt-3"><ErrorState error={error} /></div> : null}
      </form>

      <div className="mt-6 rounded-lg border bg-white p-4">
        {loading ? (
          <LoadingState label="Searching..." />
        ) : !rows.length ? (
          <EmptyState title="No results." description="Try adjusting your filters or upload more CSV data." />
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50">
                  <tr className="border-b">
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-zinc-900">{r.category}</td>
                      <td className="px-4 py-3 text-zinc-700">{r.name}</td>
                      <td className="px-4 py-3 text-zinc-700">{r.value ?? "-"}</td>
                      <td className="px-4 py-3 text-zinc-700">{r.record_date}</td>
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
          </>
        )}
      </div>
    </div>
  );
}

