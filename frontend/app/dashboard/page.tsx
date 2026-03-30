"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { apiGet, normalizeApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

import {
  Chart as ChartJS,
  CategoryScale,
  Legend,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Title);

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), { ssr: false });
const Bar = dynamic(() => import("react-chartjs-2").then((m) => m.Bar), { ssr: false });

type DashboardResponse = {
  user_growth: { month: string; growth: number }[];
  sales_figures: { labels: string[]; values: number[] };
  recent_activity: { id: number; event: string; at: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      setError("Missing JWT. Please sign in first.");
      return;
    }

    (async () => {
      try {
        const res = await apiGet<DashboardResponse>("/api/dashboard/");
        setData(res);
      } catch (e) {
        setError(normalizeApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lineChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.user_growth.map((x) => x.month),
      datasets: [
        {
          label: "User Growth",
          data: data.user_growth.map((x) => x.growth),
          borderColor: "#18181b",
          backgroundColor: "rgba(24,24,27,0.15)",
          tension: 0.25,
        },
      ],
    };
  }, [data]);

  const barChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.sales_figures.labels,
      datasets: [
        {
          label: "Sales",
          data: data.sales_figures.values,
          backgroundColor: "rgba(24,24,27,0.8)",
        },
      ],
    };
  }, [data]);

  if (loading) return <LoadingState label="Loading dashboard..." />;
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

  if (!data || (!data.user_growth.length && !data.recent_activity.length)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="No dashboard data yet." description="Create invoices or run background tasks to generate activity." />
      </div>
    );
  }

  const lastGrowth = data.user_growth[data.user_growth.length - 1]?.growth ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-600">Total user growth (last month)</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{lastGrowth}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-600">Total sales</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {data.sales_figures.values.reduce((a, b) => a + b, 0)}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-zinc-600">Recent activity</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">{data.recent_activity.length}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">User Growth</div>
          <div className="mt-3 h-64">
            {lineChartData ? <Line data={lineChartData} /> : null}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Sales Figures</div>
          <div className="mt-3 h-64">
            {barChartData ? <Bar data={barChartData} /> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Recent Activity</div>
        {data.recent_activity.length ? (
          <div className="mt-3 space-y-2">
            {data.recent_activity.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 border-t pt-2 first:border-t-0">
                <div className="text-sm text-zinc-900">{item.event}</div>
                <div className="text-xs text-zinc-600">{item.at}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-zinc-600">No activity.</div>
        )}
      </div>
    </div>
  );
}

