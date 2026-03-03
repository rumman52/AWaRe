"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck, ShieldPlus, Tags, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { DashboardPanel } from "@/components/workspace/DashboardPanel";
import { NewCasePanel } from "@/components/workspace/NewCasePanel";
import { theme } from "@/lib/theme";

type TabKey = "new-case" | "dashboard" | "chat";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "new-case", label: "New Case" },
  { key: "dashboard", label: "Dashboard" },
  { key: "chat", label: "Chat Assistant" }
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams.get("tab");
  const activeTab: TabKey = queryTab === "dashboard" || queryTab === "chat" ? queryTab : "new-case";

  const setTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`/?${next.toString()}`);
  };

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
        <div className={`hero-glow -top-16 -left-12 h-56 w-56 ${theme.background.heroGlowTeal}`} />
        <div className={`hero-glow -right-12 top-10 h-52 w-52 ${theme.background.heroGlowCoral}`} />
        <div className="relative z-10 space-y-4">
          <Badge className="border-amber-300 bg-amber-50 text-amber-800">Decision support only</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">AMR Steward</h1>
          <p className="max-w-3xl text-slate-700">Guideline-based antibiotic decision support aligned with WHO AWaRe to reduce inappropriate antibiotic use.</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge><ClipboardCheck className="h-3.5 w-3.5" />Guideline matching</Badge>
            <Badge><ShieldPlus className="h-3.5 w-3.5" />Safety filters (allergy/renal/pregnancy)</Badge>
            <Badge><Tags className="h-3.5 w-3.5" />AWaRe labeling (Access/Watch/Reserve)</Badge>
            <Badge><TimerReset className="h-3.5 w-3.5" />48–72h review reminder</Badge>
          </div>
          <Link href="/?tab=new-case"><Button>Start New Case</Button></Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              activeTab === tab.key ? "bg-indigo-600 text-white shadow-sm" : "border border-teal-300 bg-white text-slate-700 hover:bg-teal-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="bg-white/95">
        {activeTab === "new-case" && <NewCasePanel />}
        {activeTab === "dashboard" && <DashboardPanel />}
        {activeTab === "chat" && <ChatPanel />}
      </Card>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="text-sm text-slate-500">Loading workspace…</main>}>
      <WorkspaceContent />
    </Suspense>
  );
}
