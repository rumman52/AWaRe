import { Suspense } from "react";
import { WorkspaceHome } from "@/components/workspace/WorkspaceHome";

export default function HomePage() {
  return (
    <Suspense fallback={<main className="text-sm text-slate-500">Loading workspace…</main>}>
      <WorkspaceHome />
    </Suspense>
  );
}
