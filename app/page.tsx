"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, FileSearch, ShieldCheck, Stethoscope } from "lucide-react";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { DashboardPanel } from "@/components/workspace/DashboardPanel";
import { FloatingNav } from "@/components/workspace/FloatingNav";
import { NewCasePanel } from "@/components/workspace/NewCasePanel";
import { OverviewPanel } from "@/components/workspace/OverviewPanel";
import { AwareBadge } from "@/components/ui/AwareBadge";

type TabKey = "overview" | "newcase" | "dashboard" | "chat";

const tabCopy: Record<TabKey, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Understand AMR Steward at a glance" },
  newcase: { title: "New Case", subtitle: "Generate recommendations without leaving this workspace" },
  dashboard: { title: "Dashboard", subtitle: "Track AWaRe stewardship performance" },
  chat: { title: "Chat", subtitle: "Consult the embedded assistant in context" }
};

function WorkspacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = useMemo(() => {
    const queryTab = searchParams.get("tab");
    return queryTab === "newcase" || queryTab === "dashboard" || queryTab === "chat" || queryTab === "overview"
      ? queryTab
      : "overview";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [latestCaseId, setLatestCaseId] = useState("");
  const showOverviewHero = activeTab === "overview";

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const onTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`/?${next.toString()}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-indigo-100/40 p-3 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col gap-4 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:min-h-[calc(100vh-3rem)] sm:p-6">
        {showOverviewHero && (
          <header className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl space-y-2">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"><Stethoscope className="h-4 w-4" /> AMR Steward</p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">AMR Steward</h1>
                <p className="text-sm text-slate-700">Guideline-based antibiotic decision support aligned with WHO AWaRe.</p>
                <p className="max-w-2xl text-sm text-slate-600">AMR Steward helps clinicians structure antibiotic decisions, compare AWaRe-aligned options, and document safe dosing and duration. This tool is educational decision support only and does not replace clinical judgment or local policy.</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">48–72h reassessment encouraged</div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">AWaRe groups</span>
              <AwareBadge group="ACCESS" />
              <AwareBadge group="WATCH" />
              <AwareBadge group="RESERVE" />
            </div>

            <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-600">How it works</h2>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              {[
                { icon: FileSearch, title: "Step 1", body: "Capture case details and infection context." },
                { icon: ShieldCheck, title: "Step 2", body: "Generate AWaRe-coded options with dose and duration." },
                { icon: CircleAlert, title: "Step 3", body: "Review safety notes and set a 48–72h review plan." }
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600"><item.icon className="h-4 w-4" /> {item.title}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.body}</p>
                </div>
              ))}
            </div>
          </header>
        )}

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
            <p className="text-sm font-semibold text-slate-900">{tabCopy[activeTab].title}</p>
            <p className="text-xs text-slate-500">{tabCopy[activeTab].subtitle}</p>
          </div>
          <div className="h-full overflow-auto p-4 pb-36 sm:p-5 sm:pb-28">
            {activeTab === "overview" && <OverviewPanel onStartNewCase={() => onTabChange("newcase")} onOpenChat={() => onTabChange("chat")} />}
            {activeTab === "newcase" && (
              <NewCasePanel
                onCaseReady={(caseId) => setLatestCaseId(caseId)}
                onAskAssistant={(caseId) => {
                  setLatestCaseId(caseId);
                  onTabChange("chat");
                }}
              />
            )}
            {activeTab === "dashboard" && <DashboardPanel />}
            {activeTab === "chat" && <ChatPanel latestCaseId={latestCaseId} />}
          </div>
        </section>
      </div>

      <FloatingNav activeTab={activeTab} onTabChange={onTabChange} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen p-6 text-sm text-slate-500">Loading workspace…</main>}>
      <WorkspacePage />
    </Suspense>
  );
}
