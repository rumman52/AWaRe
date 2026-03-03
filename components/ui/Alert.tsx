import { HTMLAttributes } from "react";
import clsx from "clsx";

type AlertTone = "info" | "warning" | "error" | "success";

const tones: Record<AlertTone, string> = {
  info: "border-indigo-200 bg-indigo-50 text-indigo-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-red-300 bg-red-50 text-red-900",
  success: "border-green-300 bg-green-50 text-green-900"
};

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone }) {
  const tone = props.tone ?? "info";
  return <div className={clsx("rounded-xl border p-4 text-sm", tones[tone], className)} {...props} />;
}
