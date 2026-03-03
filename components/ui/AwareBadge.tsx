import type { ComponentType } from "react";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { theme, type AwareGroup } from "@/lib/theme";

const config: Record<AwareGroup, { icon: ComponentType<{ className?: string }>; className: string; label: string }> = {
  ACCESS: { icon: CheckCircle2, className: "bg-green-50 text-green-800 border-green-300", label: "Access" },
  WATCH: { icon: AlertTriangle, className: "bg-amber-50 text-amber-800 border-amber-300", label: "Watch" },
  RESERVE: { icon: Shield, className: "bg-red-50 text-red-800 border-red-300", label: "Reserve" }
};

export function AwareBadge({ group }: { group: AwareGroup }) {
  const { icon: Icon, className, label } = config[group];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${className}`}
      aria-label={`${label} AWaRe group`}
      style={{
        boxShadow: `inset 0 0 0 1px ${theme.colors.border}`
      }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {group}
    </span>
  );
}
