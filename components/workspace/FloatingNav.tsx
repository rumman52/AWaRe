"use client";

import type { ComponentType } from "react";
import { LayoutGrid, MessageSquareText, PlusCircle, Activity } from "lucide-react";

type TabKey = "overview" | "newcase" | "dashboard" | "chat";

const navItems: Array<{ key: TabKey; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "newcase", label: "New Case", icon: PlusCircle },
  { key: "dashboard", label: "Dashboard", icon: Activity },
  { key: "chat", label: "Chat", icon: MessageSquareText }
];

export function FloatingNav({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (tab: TabKey) => void }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:bottom-6 sm:right-6">
      <div className="flex w-full items-center justify-between gap-1 rounded-2xl border border-teal-200 bg-white/95 p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur sm:w-auto sm:justify-start sm:gap-2 sm:rounded-full sm:p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeTab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:flex-none sm:rounded-full sm:px-3 sm:text-xs ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white shadow"
                  : "border-teal-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-teal-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
