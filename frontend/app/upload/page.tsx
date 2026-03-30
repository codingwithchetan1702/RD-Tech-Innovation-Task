"use client";

import { useEffect, useState } from "react";

import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { apiGet, apiPostMultipart, normalizeApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

type ProcessedCSVRecord = {
  id: number;
  source_file_name: string;
  row_number: number;
  data: Record<string, unknown>;
  created_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [loadingTable, setLoadingTable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ProcessedCSVRecord[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoadingTable(false);
      setError("Missing JWT. Please sign in first.");
      return;
    }

    (async () => {
      try {
        setLoadingTable(true);
        const res = await apiGet<Paginated<ProcessedCSVRecord>>(`/api/processed-records/?page=${page}`);
        setRows(res.results);
        setCount(res.count);
      } catch (e) {
        setError(normalizeApiError(e));
      } finally {
        setLoadingTable(false);
      }
    })();
  }, [page]);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token = getAccessToken();
    if (!token) {
      setError("Missing JWT. Please sign in first.");
      return;
    }

    if (!file) {
      setError("Select a CSV file first.");
      return;
    }

    try {
      setUploading(true);
      const form = new FormData();
      form.append("file", file);
      await apiPostMultipart<{ rows_stored: number; source_file_name: string }>("/api/upload-csv/", form);

      // Refresh table
      const res = await apiGet<Paginated<ProcessedCSVRecord>>(`/api/processed-records/?page=1`);
      setRows(res.results);
      setCount(res.count);
      setPage(1);
    } catch (e2) {
      setError(normalizeApiError(e2));
    } finally {
      setUploading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / 10));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold text-zinc-900">Upload CSV</h1>

      <form className="mt-4 rounded-lg border bg-white p-4" onSubmit={onUpload}>
        <div className="flex items-end justify-between gap-3">
          <div className="w-full">
            <label className="text-sm font-medium text-zinc-800">CSV file</label>
            <input
              className="mt-1 w-full text-sm"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {error ? <div className="mt-3"><ErrorState error={error} /></div> : null}
      </form>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900">Processed Records</h2>
          <div className="text-sm text-zinc-600">Total: {count}</div>
        </div>

        {loadingTable ? (
          <LoadingState label="Loading processed records..." />
        ) : error && rows.length === 0 ? (
          <div className="mt-3">
            <ErrorState error={error} />
          </div>
        ) : !rows.length ? (
          <EmptyState title="No processed records yet." description="Upload a CSV to populate the table." />
        ) : (
          <>
            <div className="mt-3 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50">
                  <tr className="border-b">
                    <th className="px-4 py-3">Row</th>
                    <th className="px-4 py-3">Data (JSON)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-zinc-900">{r.row_number}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words text-xs">
                          {JSON.stringify(r.data)}
                        </pre>
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
          </>
        )}
      </div>
    </div>
  );
}

