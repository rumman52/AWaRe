"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { AwareBadge } from "@/components/ui/AwareBadge";

const infections = [
  { key: "uti_uncomplicated", label: "UTI - uncomplicated" },
  { key: "uti_complicated", label: "UTI - complicated" },
  { key: "cap_mild", label: "Community-acquired pneumonia - mild" },
  { key: "cap_severe", label: "Community-acquired pneumonia - severe" },
  { key: "ssti", label: "Skin/soft tissue infection" }
];

type Result = {
  antibioticName: string;
  awareGroup: "ACCESS" | "WATCH" | "RESERVE";
  doseText: string;
  durationDaysRange: [number, number];
  route: string;
  criteria: string;
  notes?: string;
};

export function NewCasePanel({ onCaseGenerated }: { onCaseGenerated?: (caseId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseId, setCaseId] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [form, setForm] = useState({
    setting: "primary_care",
    suspectedInfectionKey: "uti_uncomplicated",
    severity: "uncomplicated",
    age: 42,
    sex: "female",
    pregnancy: false,
    allergiesText: "",
    creatinineOrEgfr: "eGFR 88",
    symptomsText: "",
    chosenAntibiotic: "",
    chosenDose: "",
    chosenDurationDays: 5,
    justificationText: ""
  });

  const infectionLabel = useMemo(
    () => infections.find((item) => item.key === form.suspectedInfectionKey)?.label ?? form.suspectedInfectionKey,
    [form.suspectedInfectionKey]
  );

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || "Failed to generate recommendation. Please retry.");
        return;
      }

      setCaseId(payload.id);
      onCaseGenerated?.(payload.id);
      setResults(Array.isArray(payload.suggestedRegimens) ? payload.suggestedRegimens : []);
    } catch {
      setError("Service unavailable right now. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card className="border-t-4 border-t-indigo-500">
          <h2 className="section-title">New stewardship case</h2>
          <p className="mt-1 text-sm text-slate-600">Create one case and get immediate AWaRe-aligned options below without leaving this workspace.</p>
        </Card>

        <Card className="border-t-4 border-t-teal-500">
          <h3 className="text-base font-semibold">Patient</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label><span className="field-label">Age</span><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></label>
            <label><span className="field-label">Sex</span><Input value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} /></label>
            <label className="md:col-span-2"><span className="field-label">Symptoms / notes</span><Textarea className="min-h-24" value={form.symptomsText} onChange={(e) => setForm({ ...form, symptomsText: e.target.value })} /></label>
          </div>
        </Card>

        <Card className="border-t-4 border-t-indigo-500">
          <h3 className="text-base font-semibold">Infection</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label><span className="field-label">Setting</span><Select value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })}><option value="primary_care">Primary care</option><option value="hospital">Hospital</option></Select></label>
            <label><span className="field-label">Suspected infection</span><Select value={form.suspectedInfectionKey} onChange={(e) => setForm({ ...form, suspectedInfectionKey: e.target.value })}>{infections.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</Select></label>
            <label><span className="field-label">Severity</span><Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option value="uncomplicated">Uncomplicated</option><option value="complicated">Complicated</option><option value="severe">Severe</option></Select></label>
          </div>
        </Card>

        <Card className="border-t-4 border-t-teal-500">
          <h3 className="text-base font-semibold">Safety</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label><span className="field-label">Allergies</span><Input value={form.allergiesText} placeholder="e.g., penicillin rash" onChange={(e) => setForm({ ...form, allergiesText: e.target.value })} /></label>
            <label><span className="field-label">eGFR / Creatinine</span><Input value={form.creatinineOrEgfr} onChange={(e) => setForm({ ...form, creatinineOrEgfr: e.target.value })} /></label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.pregnancy} onChange={(e) => setForm({ ...form, pregnancy: e.target.checked })} /> Pregnancy</label>
          </div>
        </Card>

        {error && <Alert tone="error">{error}</Alert>}

        {results.length > 0 && (
          <Card className="border-t-4 border-t-cyan-500">
            <h3 className="text-lg font-semibold">Recommendation results</h3>
            <div className="mt-4 space-y-3">
              {results.map((item) => (
                <div key={item.antibioticName} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{item.antibioticName}</p>
                      <AwareBadge group={item.awareGroup} />
                    </div>
                    <div className="text-sm text-slate-700">
                      <p><strong>Dose:</strong> {item.doseText}</p>
                      <p><strong>Duration:</strong> {item.durationDaysRange[0]}-{item.durationDaysRange[1]} days</p>
                    </div>
                  </div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    <li>{item.criteria}</li>
                    <li>{item.route} route</li>
                    {item.notes ? <li>{item.notes}</li> : null}
                  </ul>
                  <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">Review in 48–72h and de-escalate where clinically appropriate.</p>
                </div>
              ))}
            </div>
            {caseId ? <p className="mt-3 text-xs text-slate-500">Case saved: {caseId}</p> : null}
          </Card>
        )}
      </div>

      <aside className="lg:sticky lg:top-4 lg:h-fit">
        <Card className="border-t-4 border-t-indigo-500">
          <h3 className="text-base font-semibold">Case summary</h3>
          <dl className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between"><dt>Patient</dt><dd>{form.age} / {form.sex}</dd></div>
            <div className="flex justify-between gap-3"><dt>Infection</dt><dd className="text-right">{infectionLabel}</dd></div>
            <div className="flex justify-between"><dt>Setting</dt><dd>{form.setting.replace("_", " ")}</dd></div>
            <div className="flex justify-between"><dt>Risk flag</dt><dd>{form.pregnancy ? "Pregnancy" : "None"}</dd></div>
          </dl>
          <Button className="mt-5 w-full" onClick={submit} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Recommendation</>}</Button>
          <Link href="/?tab=chat" className="mt-3 block"><Button className="w-full" variant="secondary"><MessageCircle className="h-4 w-4" /> Chat Assistant</Button></Link>
        </Card>
      </aside>
    </div>
  );
}
