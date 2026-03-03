"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, ShieldCheck, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";

type MetricsResponse = {
  metrics: Array<{ date: string; accessCount: number; watchCount: number; reserveCount: number; totalCount: number }>;
  topWatch: Array<{ name: string; count: number }>;
  reviewOverdue: Array<{ caseId: string; reviewDueAt: string; infection: string }>;
};

const chartColors = ["#15803d", "#b45309", "#b91c1c"];

export function DashboardPanel() {
  const [data, setData] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    fetch("/api/metrics").then((res) => res.json()).then(setData);
  }, []);

  const latest = data?.metrics[data.metrics.length - 1];
  const awareSplit = useMemo(
    () => [
      { name: "Access", value: latest?.accessCount ?? 0 },
      { name: "Watch", value: latest?.watchCount ?? 0 },
      { name: "Reserve", value: latest?.reserveCount ?? 0 }
    ],
    [latest]
  );

  if (!data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-indigo-400"><p className="flex items-center gap-2 text-sm text-slate-600"><Activity className="h-4 w-4" />Total cases</p><p className="mt-2 text-3xl font-semibold">{latest?.totalCount ?? 0}</p></Card>
        <Card className="border-t-4 border-t-green-400"><p className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="h-4 w-4" />Access %</p><p className="mt-2 text-3xl font-semibold text-green-700">{latest ? Math.round((latest.accessCount / Math.max(latest.totalCount, 1)) * 100) : 0}%</p></Card>
        <Card className="border-t-4 border-t-amber-400"><p className="flex items-center gap-2 text-sm text-slate-600"><TrendingUp className="h-4 w-4" />Watch %</p><p className="mt-2 text-3xl font-semibold text-amber-700">{latest ? Math.round((latest.watchCount / Math.max(latest.totalCount, 1)) * 100) : 0}%</p></Card>
        <Card className="border-t-4 border-t-rose-400"><p className="flex items-center gap-2 text-sm text-slate-600"><AlertCircle className="h-4 w-4" />Reviews due</p><p className="mt-2 text-3xl font-semibold">{data.reviewOverdue.length}</p></Card>
      </section>

      {data.metrics.length === 0 ? (
        <Card className="text-center"><p className="text-sm text-slate-500">No dashboard data yet. Create a case to populate stewardship analytics.</p></Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="h-[320px]"><h3 className="text-base font-semibold">AWaRe distribution</h3><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={awareSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>{awareSplit.map((_, idx) => <Cell key={idx} fill={chartColors[idx]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></Card>
          <Card>
            <h3 className="text-base font-semibold">Top Watch antibiotics</h3>
            {data.topWatch.length === 0 ? <p className="mt-3 text-sm text-slate-500">No Watch antibiotics recorded yet.</p> : <ul className="mt-3 space-y-2 text-sm">{data.topWatch.map((item) => <li key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"><span>{item.name}</span><strong>{item.count}</strong></li>)}</ul>}
          </Card>
        </section>
      )}
    </div>
  );
}
