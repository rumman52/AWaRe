"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck, MessageSquareHeart, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { NewCasePanel } from "@/components/workspace/NewCasePanel";
import { DashboardPanel } from "@/components/workspace/DashboardPanel";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Tab = "new-case" | "dashboard" | "chat";

const featureItems = [
  { icon: ClipboardCheck, title: "Guideline matching" },
  { icon: ShieldCheck, title: "Safety filters (allergy/renal/pregnancy)" },
  { icon: Sparkles, title: "AWaRe labeling (Access/Watch/Reserve)" },
  { icon: MessageSquareHeart, title: "48–72h review reminder" }
];

export function WorkspaceHome() {
  const searchParams = useSearchParams();
  const [lastCaseId, setLastCaseId] = useState<string>();
  const tabParam = searchParams.get("tab");
  const tab: Tab = tabParam === "dashboard" || tabParam === "chat" ? tabParam : "new-case";

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-100 via-white to-teal-100 p-6 md:p-8">
        <div className="pointer-events-none absolute -top-16 right-16 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 rounded-full bg-indigo-300/30 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"><Stethoscope className="h-4 w-4" /> AMR Steward</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">AMR Steward</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">Guideline-based antibiotic decision support aligned with WHO AWaRe to reduce inappropriate antibiotic use.</p>
            <div className="mt-4 inline-flex items-center rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold text-teal-800">WHO AWaRe aligned</div>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Decision support only</div>
        </div>

        <div className="relative mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {featureItems.map(({ icon: Icon, title }) => (
            <div key={title} className="rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-sm text-slate-700 shadow-sm">
              <p className="inline-flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-indigo-600" /> {title}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-5">
          <Link href="/?tab=new-case"><Button>Start New Case</Button></Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[{ key: "new-case", label: "New Case" }, { key: "dashboard", label: "Dashboard" }, { key: "chat", label: "Chat Assistant" }].map((item) => (
          <Link key={item.key} href={`/?tab=${item.key}`} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === item.key ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow" : "border border-teal-600 bg-white text-teal-700 hover:bg-teal-50"}`}>
            {item.label}
          </Link>
        ))}
      </div>

      <Card className="border-t-4 border-t-indigo-500 min-h-[540px]">
        {tab === "dashboard" ? <DashboardPanel /> : tab === "chat" ? <ChatPanel caseId={lastCaseId} /> : <NewCasePanel onCaseGenerated={setLastCaseId} />}
      </Card>
    </main>
  );
}
