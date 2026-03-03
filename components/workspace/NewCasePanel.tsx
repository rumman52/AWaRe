"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Clipboard, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { AwareBadge } from "@/components/ui/AwareBadge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";

type RecommendationOption = {
  antibioticName: string;
  awareGroup: "ACCESS" | "WATCH" | "RESERVE";
  doseText: string;
  durationDaysRange: [number, number];
  route: string;
  criteria: string;
};

const infections = [
  { key: "uti_uncomplicated", label: "UTI - uncomplicated" },
  { key: "uti_complicated", label: "UTI - complicated" },
  { key: "cap_mild", label: "Community-acquired pneumonia - mild" },
  { key: "cap_severe", label: "Community-acquired pneumonia - severe" },
  { key: "ssti", label: "Skin/soft tissue infection" }
];

export function NewCasePanel({ onCaseReady, onAskAssistant }: { onCaseReady: (caseId: string) => void; onAskAssistant: (caseId: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyToast, setCopyToast] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationOption[]>([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [openCards, setOpenCards] = useState({ patient: true, infection: true, safety: false });
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

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!form.age || form.age < 1) missing.push("Age");
    if (!form.sex.trim()) missing.push("Sex");
    if (!form.setting.trim()) missing.push("Care setting");
    if (!form.suspectedInfectionKey.trim()) missing.push("Suspected infection");
    if (!form.severity.trim()) missing.push("Severity");
    return missing;
  }, [form]);

  const activeStep = recommendations.length > 0 ? 4 : missingFields.length > 0 ? 2 : 3;

  const caseSummaryText = useMemo(() => {
    const infectionLabel = infections.find((it) => it.key === form.suspectedInfectionKey)?.label ?? form.suspectedInfectionKey;
    return [
      `AMR Steward case summary`,
      `Patient: ${form.age} year old ${form.sex}`,
      `Setting: ${form.setting.replace("_", " ")}`,
      `Infection: ${infectionLabel}`,
      `Severity: ${form.severity}`,
      `Safety: Pregnancy=${form.pregnancy ? "yes" : "no"}; Allergy=${form.allergiesText || "none documented"}; Renal=${form.creatinineOrEgfr || "not provided"}`
    ].join("\n");
  }, [form]);

  const submit = async () => {
    if (missingFields.length > 0) return;

    setError("");
    setCaseId("");
    setRecommendations([]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.error || "Failed to generate recommendation.";
        setError(`${message} Please review fields and try again.`);
        return;
      }

      const data = (await res.json()) as { id: string };
      setCaseId(data.id);
      onCaseReady(data.id);

      const detail = await fetch(`/api/cases/${data.id}`);
      const detailPayload = (await detail.json()) as { recommendation?: { suggestedRegimensJson: string } };
      if (detail.ok && detailPayload.recommendation) {
        setRecommendations(JSON.parse(detailPayload.recommendation.suggestedRegimensJson));
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    } catch {
      setError("We couldn't reach the recommendation service. Please retry in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(caseSummaryText);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 1600);
  };

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["Patient", "Infection", "Safety", "Results"].map((label, idx) => {
          const complete = idx + 1 < activeStep;
          const current = idx + 1 === activeStep;
          return (
            <div key={label} className={`rounded-xl border p-3 text-sm ${complete ? "border-teal-300 bg-teal-50" : current ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-600">{complete ? "Complete" : current ? "In progress" : "Pending"}</p>
            </div>
          );
        })}
      </div>

      {missingFields.length > 0 && <Alert tone="warning">Required before generate: {missingFields.join(", ")}.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {copyToast && <Alert tone="success">Copied!</Alert>}

      <Card className="p-0">
        <button className="flex w-full items-center justify-between p-4 text-left sm:p-5" onClick={() => setOpenCards((prev) => ({ ...prev, patient: !prev.patient }))}>
          <h3 className="text-base font-semibold">Patient (required)</h3>
          <ChevronDown className={`h-4 w-4 transition ${openCards.patient ? "rotate-180" : ""}`} />
        </button>
        {openCards.patient && (
          <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2 sm:p-5">
            <label><span className="field-label">Age</span><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></label>
            <label><span className="field-label">Sex</span><Input value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} /></label>
            <label className="md:col-span-2"><span className="field-label">Symptoms / notes</span><Textarea className="min-h-24" value={form.symptomsText} onChange={(e) => setForm({ ...form, symptomsText: e.target.value })} /></label>
          </div>
        )}
      </Card>

      <Card className="p-0">
        <button className="flex w-full items-center justify-between p-4 text-left sm:p-5" onClick={() => setOpenCards((prev) => ({ ...prev, infection: !prev.infection }))}>
          <h3 className="text-base font-semibold">Infection (required)</h3>
          <ChevronDown className={`h-4 w-4 transition ${openCards.infection ? "rotate-180" : ""}`} />
        </button>
        {openCards.infection && (
          <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2 sm:p-5">
            <label>
              <span className="field-label">Care setting</span>
              <Select value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })}>
                <option value="primary_care">Primary care</option><option value="hospital">Hospital</option>
              </Select>
            </label>
            <label>
              <span className="field-label">Suspected infection</span>
              <Select value={form.suspectedInfectionKey} onChange={(e) => setForm({ ...form, suspectedInfectionKey: e.target.value })}>
                {infections.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </Select>
            </label>
            <label>
              <span className="field-label">Severity</span>
              <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="uncomplicated">Uncomplicated</option><option value="complicated">Complicated</option><option value="severe">Severe</option>
              </Select>
            </label>
          </div>
        )}
      </Card>

      <Card className="p-0">
        <button className="flex w-full items-center justify-between p-4 text-left sm:p-5" onClick={() => setOpenCards((prev) => ({ ...prev, safety: !prev.safety }))}>
          <h3 className="text-base font-semibold">Safety (optional)</h3>
          <ChevronDown className={`h-4 w-4 transition ${openCards.safety ? "rotate-180" : ""}`} />
        </button>
        {openCards.safety && (
          <div className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2 sm:p-5">
            <label>
              <span className="field-label">Allergies</span>
              <Input value={form.allergiesText} onChange={(e) => setForm({ ...form, allergiesText: e.target.value })} placeholder="e.g., penicillin rash" />
              <p className="field-help">Include reaction type if known to improve safety filtering.</p>
            </label>
            <label>
              <span className="field-label">Renal function (eGFR)</span>
              <Input value={form.creatinineOrEgfr} onChange={(e) => setForm({ ...form, creatinineOrEgfr: e.target.value })} placeholder="eGFR 88 mL/min" />
              <p className="field-help">Enter most recent eGFR or creatinine note for dose caution prompts.</p>
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.pregnancy} onChange={(e) => setForm({ ...form, pregnancy: e.target.checked })} /> Pregnancy
            </label>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold">Actions</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <Button className="w-full sm:w-auto" onClick={submit} disabled={isLoading || missingFields.length > 0}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating recommendation...</> : <><Sparkles className="h-4 w-4" /> Generate Recommendation</>}
          </Button>
          <Button className="w-full sm:w-auto" variant="secondary" onClick={copySummary}><Clipboard className="h-4 w-4" /> Copy case summary</Button>
          <Button className="w-full sm:w-auto" variant="ghost" disabled={!caseId} onClick={() => caseId && onAskAssistant(caseId)}><MessageCircle className="h-4 w-4" /> Ask assistant about this case</Button>
        </div>
      </Card>

      <div ref={resultsRef}>
        {recommendations.length > 0 && (
          <Card className="space-y-4 overflow-hidden border-t-4 border-t-indigo-400">
            <h3 className="text-lg font-semibold">Results</h3>
            {recommendations.map((option) => (
              <div key={option.antibioticName} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{option.antibioticName}</p>
                  <AwareBadge group={option.awareGroup} />
                </div>
                <p className="mt-2 text-sm text-slate-700"><strong>Dose:</strong> {option.doseText} ({option.route})</p>
                <p className="text-sm text-slate-700"><strong>Duration:</strong> {option.durationDaysRange[0]}–{option.durationDaysRange[1]} days</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                  <li>{option.criteria}</li>
                  <li>Confirm indication with local guideline and culture data.</li>
                  <li>Reassess adverse-effect risks before continuation.</li>
                </ul>
                <div className="mt-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">Review in 48–72h</div>
                <details className="mt-3 rounded-xl border border-slate-200 p-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-slate-800">Why this recommendation?</summary>
                  <p className="mt-2 text-slate-600">Based on the seeded infection guide for this setting plus safety inputs (pregnancy, allergies, renal function). AWaRe labels highlight stewardship priority and review timing supports 48–72h reassessment.</p>
                </details>
              </div>
            ))}
            {caseId && <p className="text-xs text-slate-500">Case ID: {caseId.slice(0, 8)}… <CheckCircle2 className="inline h-3.5 w-3.5 text-teal-600" /></p>}
          </Card>
        )}
      </div>
    </section>
  );
}
