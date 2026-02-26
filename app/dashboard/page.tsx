"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SourceBadge } from "@/components/source-badge";

type MetricsResponse = {
  metrics: Array<{ date: string; accessCount: number; watchCount: number; reserveCount: number; totalCount: number }>;
  topWatch: Array<{ name: string; count: number }>;
  reviewOverdue: Array<{ caseId: string; reviewDueAt: string; infection: string }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    fetch("/api/metrics").then((res) => res.json()).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  const latest = data.metrics[data.metrics.length - 1];
  const accessPct = latest ? Math.round((latest.accessCount / Math.max(latest.totalCount, 1)) * 100) : 0;

  return (
    <main className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-600">Access use</p><p className="text-2xl font-bold">{accessPct}%</p><p className="text-xs">WHO target: ≥70%</p></div>
        <div className="card"><p className="text-sm text-slate-600">Watch agents</p><p className="text-2xl font-bold">{latest?.watchCount ?? 0}</p></div>
        <div className="card"><p className="text-sm text-slate-600">Reserve agents</p><p className="text-2xl font-bold">{latest?.reserveCount ?? 0}</p></div>
      </section>

      <section className="card h-80">
        <h3 className="mb-2 font-semibold">AWaRe trend by day</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="accessCount" fill="#10b981" />
            <Bar dataKey="watchCount" fill="#f59e0b" />
            <Bar dataKey="reserveCount" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card h-64">
          <h3 className="mb-2 font-semibold">Top Watch antibiotics used</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.topWatch} nameKey="name" dataKey="count" outerRadius={80} fill="#f59e0b" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="mb-2 font-semibold">Review overdue</h3>
          <ul className="space-y-2 text-sm">
            {data.reviewOverdue.map((item) => (
              <li key={item.caseId} className="rounded border border-slate-200 p-2">Case {item.caseId.slice(0, 8)}… ({item.infection}) due {new Date(item.reviewDueAt).toLocaleString()}</li>
            ))}
            {data.reviewOverdue.length === 0 && <li>No overdue reviews 🎉</li>}
          </ul>
        </div>
      </section>
      <SourceBadge citation="WHO 70% Access indicator" href="https://www.who.int/data/gho/indicator-metadata-registry/imr-details/5767" />
    </main>
  );
}
