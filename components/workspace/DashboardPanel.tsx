"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, ShieldCheck, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { AwareBadge } from "@/components/ui/AwareBadge";
import { Card } from "@/components/ui/Card";

type MetricsResponse = {
  metrics: Array<{ date: string; accessCount: number; watchCount: number; reserveCount: number; totalCount: number }>;
  topWatch: Array<{ name: string; count: number }>;
  reviewOverdue: Array<{ caseId: string; reviewDueAt: string; infection: string }>;
};

const awareColors: Record<"Access" | "Watch" | "Reserve", string> = {
  Access: "#16A34A",
  Watch: "#D97706",
  Reserve: "#DC2626"
};

export function DashboardPanel() {
  const [data, setData] = useState<MetricsResponse | null>(null);

  useEffect(() => {
    fetch("/api/metrics").then((res) => res.json()).then(setData);
  }, []);

  const latest = data?.metrics[data.metrics.length - 1];
  const awareSplit = useMemo(
    () => [
      { name: "Access" as const, value: latest?.accessCount ?? 0 },
      { name: "Watch" as const, value: latest?.watchCount ?? 0 },
      { name: "Reserve" as const, value: latest?.reserveCount ?? 0 }
    ],
    [latest]
  );

  if (!data) return <p className="text-sm text-slate-500">Loading dashboard…</p>;

  const total = latest?.totalCount ?? 0;
  const accessPct = latest ? Math.round((latest.accessCount / Math.max(total, 1)) * 100) : 0;
  const watchPct = latest ? Math.round((latest.watchCount / Math.max(total, 1)) * 100) : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-indigo-400"><p className="flex items-center gap-2 text-sm text-slate-600"><Activity className="h-4 w-4" />Total cases</p><p className="mt-2 text-3xl font-semibold">{total}</p></Card>
        <Card className="border-t-4 border-t-green-400"><p className="flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="h-4 w-4" />% Access</p><p className="mt-2 text-3xl font-semibold text-green-700">{accessPct}%</p></Card>
        <Card className="border-t-4 border-t-amber-400"><p className="flex items-center gap-2 text-sm text-slate-600"><TrendingUp className="h-4 w-4" />% Watch</p><p className="mt-2 text-3xl font-semibold text-amber-700">{watchPct}%</p></Card>
        <Card className="border-t-4 border-t-rose-400"><p className="flex items-center gap-2 text-sm text-slate-600"><AlertCircle className="h-4 w-4" />Reviews due</p><p className="mt-2 text-3xl font-semibold">{data.reviewOverdue.length}</p></Card>
      </section>

      {data.metrics.length === 0 ? (
        <Card className="bg-gradient-to-r from-indigo-50 via-white to-teal-50 text-center">
          <p className="text-lg font-semibold text-slate-900">No cases yet</p>
          <p className="mt-1 text-sm text-slate-600">Once you generate recommendations, this dashboard will show AWaRe mix, usage trends, and review reminders.</p>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Access / Watch / Reserve distribution</h3>
            <div className="flex flex-wrap items-center gap-2">
              <AwareBadge group="ACCESS" />
              <AwareBadge group="WATCH" />
              <AwareBadge group="RESERVE" />
            </div>
          </div>
          <div className="mt-4 h-[240px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={awareSplit}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {awareSplit.map((entry) => (
                    <Cell key={entry.name} fill={awareColors[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
