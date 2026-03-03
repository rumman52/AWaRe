"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlarmClockCheck, ChartColumn, ShieldAlert } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";

type MetricsResponse = {
  metrics: Array<{ date: string; accessCount: number; watchCount: number; reserveCount: number; totalCount: number }>;
  topWatch: Array<{ name: string; count: number }>;
  reviewOverdue: Array<{ caseId: string; reviewDueAt: string; infection: string }>;
  error?: string;
};

const colors = ["#15803d", "#b45309", "#b91c1c"];

export function DashboardPanel() {
  const [data, setData] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    fetch("/api/metrics").then((res) => res.json()).then(setData).catch(() => setData({ metrics: [], topWatch: [], reviewOverdue: [], error: "Failed to load dashboard" }));
  }, []);

  const latest = data?.metrics[data.metrics.length - 1];
  const totalCases = latest?.totalCount ?? 0;
  const accessPct = latest ? Math.round((latest.accessCount / Math.max(latest.totalCount, 1)) * 100) : 0;
  const watchPct = latest ? Math.round((latest.watchCount / Math.max(latest.totalCount, 1)) * 100) : 0;

  const split = useMemo(() => [
    { name: "Access", value: latest?.accessCount ?? 0 },
    { name: "Watch", value: latest?.watchCount ?? 0 },
    { name: "Reserve", value: latest?.reserveCount ?? 0 }
  ], [latest]);

  if (!data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;
  if (data.error) return <Card><p className="text-sm text-amber-800">{data.error}</p></Card>;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-indigo-500"><p className="inline-flex items-center gap-2 text-sm text-slate-600"><Activity className="h-4 w-4 text-indigo-600" /> Total cases</p><p className="mt-2 text-3xl font-semibold">{totalCases}</p></Card>
        <Card className="border-t-4 border-t-green-500"><p className="inline-flex items-center gap-2 text-sm text-slate-600"><ChartColumn className="h-4 w-4 text-green-600" /> % Access</p><p className="mt-2 text-3xl font-semibold text-green-700">{accessPct}%</p></Card>
        <Card className="border-t-4 border-t-amber-500"><p className="inline-flex items-center gap-2 text-sm text-slate-600"><ShieldAlert className="h-4 w-4 text-amber-600" /> % Watch</p><p className="mt-2 text-3xl font-semibold text-amber-700">{watchPct}%</p></Card>
        <Card className="border-t-4 border-t-teal-500"><p className="inline-flex items-center gap-2 text-sm text-slate-600"><AlarmClockCheck className="h-4 w-4 text-teal-700" /> Reviews due</p><p className="mt-2 text-3xl font-semibold">{data.reviewOverdue.length}</p></Card>
      </section>

      {data.metrics.length === 0 ? <Card><p className="text-sm text-slate-500">No data yet. Create a case to populate stewardship analytics.</p></Card> : (
        <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="border-t-4 border-t-indigo-500 h-[320px]">
            <h3 className="text-base font-semibold">AWaRe distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={split} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92}>
                  {split.map((_, idx) => <Cell key={idx} fill={colors[idx]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-teal-500">
              <h3 className="text-base font-semibold">Top Watch antibiotics</h3>
              {data.topWatch.length === 0 ? <p className="mt-3 text-sm text-slate-500">No Watch antibiotics yet.</p> : (
                <ul className="mt-3 space-y-2 text-sm">{data.topWatch.map((item) => <li key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"><span>{item.name}</span><strong>{item.count}</strong></li>)}</ul>
              )}
            </Card>
            <Card className="border-t-4 border-t-indigo-500">
              <h3 className="text-base font-semibold">Overdue reviews</h3>
              {data.reviewOverdue.length === 0 ? <p className="mt-3 text-sm text-slate-500">No overdue reviews.</p> : (
                <ul className="mt-3 space-y-2 text-sm">{data.reviewOverdue.map((item) => <li key={item.caseId} className="rounded-xl border border-slate-200 px-3 py-2"><p className="font-medium">{item.caseId.slice(0, 8)}…</p><p className="text-slate-600">{item.infection}</p></li>)}</ul>
              )}
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
