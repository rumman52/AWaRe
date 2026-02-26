"use client";

import { useEffect, useState } from "react";
import { SourceBadge } from "@/components/source-badge";

type Guide = {
  id: string;
  infectionKey: string;
  setting: string;
  recommendedOptionsJson: string;
  durationRulesJson: string;
  redFlagsJson: string;
  sourceUrl: string;
};

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    fetch("/api/guides").then((r) => r.json()).then(setGuides);
  }, []);

  const save = async (guide: Guide) => {
    await fetch("/api/guides", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guide)
    });
    alert("Guide saved");
  };

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Guide editor (demo)</h2>
      {guides.map((guide, index) => (
        <div key={guide.id} className="card space-y-2">
          <p className="text-sm font-medium">{guide.infectionKey} ({guide.setting})</p>
          <label><span className="label">Recommended options JSON</span><textarea className="input min-h-28" value={guide.recommendedOptionsJson} onChange={(e) => setGuides(guides.map((g, i) => i === index ? { ...g, recommendedOptionsJson: e.target.value } : g))} /></label>
          <label><span className="label">Duration rules JSON</span><textarea className="input min-h-20" value={guide.durationRulesJson} onChange={(e) => setGuides(guides.map((g, i) => i === index ? { ...g, durationRulesJson: e.target.value } : g))} /></label>
          <label><span className="label">Red flags JSON</span><textarea className="input min-h-20" value={guide.redFlagsJson} onChange={(e) => setGuides(guides.map((g, i) => i === index ? { ...g, redFlagsJson: e.target.value } : g))} /></label>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => save(guide)}>Save</button>
        </div>
      ))}
      <SourceBadge citation="WHO AWaRe classification updates" href="https://www.who.int/publications/i/item/B09489" />
    </main>
  );
}
