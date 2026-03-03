import type { ComponentType } from "react";
import { CheckCircle2, ShieldAlert, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type AwareGroup = "ACCESS" | "WATCH" | "RESERVE";

const awareConfig: Record<AwareGroup, { icon: ComponentType<{ className?: string }>; className: string; hint: string }> = {
  ACCESS: {
    icon: CheckCircle2,
    className: "border-green-300 bg-green-50 text-green-800",
    hint: "First-line narrow-spectrum option when suitable"
  },
  WATCH: {
    icon: ShieldAlert,
    className: "border-amber-300 bg-amber-50 text-amber-800",
    hint: "Higher resistance risk; review necessity"
  },
  RESERVE: {
    icon: ShieldX,
    className: "border-red-300 bg-red-50 text-red-800",
    hint: "Last-resort use only for confirmed need"
  }
};

export function AwareBadge({ group }: { group: AwareGroup }) {
  const { icon: Icon, className, hint } = awareConfig[group];
  return (
    <Badge className={className} aria-label={`AWaRe category ${group}. ${hint}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{group}</span>
      <span className="sr-only">{hint}</span>
    </Badge>
  );
}
