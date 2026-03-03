"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { DashboardPanel } from "@/components/workspace/DashboardPanel";
import { NewCasePanel } from "@/components/workspace/NewCasePanel";
import { OverviewPanel } from "@/components/workspace/OverviewPanel";

type TabKey = "overview" | "new-case" | "dashboard" | "chat";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "new-case", label: "New Case" },
  { key: "dashboard", label: "Dashboard" },
  { key: "chat", label: "Chat Assistant" }
];

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams.get("tab");
  const activeTab: TabKey =
    queryTab === "new-case" || queryTab === "dashboard" || queryTab === "chat" || queryTab === "overview"
      ? queryTab
      : "overview";

  const [latestCaseId, setLatestCaseId] = useState<string>("");

  const setTab = (tab: TabKey) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`/?${next.toString()}`);
  };

  return (
    <main className="space-y-6">
      <section className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interactive Workspace</p>
          <h1 className="text-xl font-semibold text-slate-900">AMR Steward</h1>
        </div>
        <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
          <Stethoscope className="h-3.5 w-3.5" /> WHO AWaRe aligned
        </Badge>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              activeTab === tab.key
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-teal-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="min-h-[620px] bg-white/95">
        {activeTab === "overview" && <OverviewPanel onStartNewCase={() => setTab("new-case")} onOpenChat={() => setTab("chat")} />}
        {activeTab === "new-case" && (
          <NewCasePanel
            onCaseReady={(caseId) => setLatestCaseId(caseId)}
            onAskAssistant={(caseId) => {
              setLatestCaseId(caseId);
              setTab("chat");
            }}
          />
        )}
        {activeTab === "dashboard" && <DashboardPanel />}
        {activeTab === "chat" && <ChatPanel latestCaseId={latestCaseId} />}
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
