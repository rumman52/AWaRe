import { Suspense } from "react";
import { WorkspaceHome } from "@/components/workspace/WorkspaceHome";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading workspace…</main>}>
      <WorkspaceHome />
    </Suspense>
  );
}
