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
    <nav className="fixed bottom-6 right-6 z-40">
      <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-white/95 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeTab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
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
