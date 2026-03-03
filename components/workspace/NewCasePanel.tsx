"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
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

export function NewCasePanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseId, setCaseId] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationOption[]>([]);
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

  const submit = async () => {
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

      const detail = await fetch(`/api/cases/${data.id}`);
      const detailPayload = (await detail.json()) as { recommendation?: { suggestedRegimensJson: string } };
      if (detail.ok && detailPayload.recommendation) {
        setRecommendations(JSON.parse(detailPayload.recommendation.suggestedRegimensJson));
      }
    } catch {
      setError("We couldn't reach the recommendation service. Please retry in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <Card className="border-t-4 border-t-indigo-400">
          <h3 className="text-base font-semibold">Patient</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="field-label">Age</span>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
            </label>
            <label>
              <span className="field-label">Sex</span>
              <Input value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} />
            </label>
            <label className="md:col-span-2">
              <span className="field-label">Symptoms / notes</span>
              <Textarea className="min-h-24" value={form.symptomsText} onChange={(e) => setForm({ ...form, symptomsText: e.target.value })} />
            </label>
          </div>
        </Card>

        <Card className="border-t-4 border-t-teal-400">
          <h3 className="text-base font-semibold">Infection</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="field-label">Care setting</span>
              <Select value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })}>
                <option value="primary_care">Primary care</option>
                <option value="hospital">Hospital</option>
              </Select>
            </label>
            <label>
              <span className="field-label">Suspected infection</span>
              <Select value={form.suspectedInfectionKey} onChange={(e) => setForm({ ...form, suspectedInfectionKey: e.target.value })}>
                {infections.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </Select>
            </label>
            <label>
              <span className="field-label">Severity</span>
              <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="uncomplicated">Uncomplicated</option>
                <option value="complicated">Complicated</option>
                <option value="severe">Severe</option>
              </Select>
            </label>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold">Safety</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className="field-label">Allergies</span>
              <Input value={form.allergiesText} onChange={(e) => setForm({ ...form, allergiesText: e.target.value })} placeholder="e.g., penicillin rash" />
            </label>
            <label>
              <span className="field-label">Renal function</span>
              <Input value={form.creatinineOrEgfr} onChange={(e) => setForm({ ...form, creatinineOrEgfr: e.target.value })} placeholder="eGFR 88 mL/min" />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.pregnancy} onChange={(e) => setForm({ ...form, pregnancy: e.target.checked })} />
              Pregnancy
            </label>
          </div>
        </Card>

        {error && <Alert tone="error">{error}</Alert>}

        {recommendations.length > 0 && (
          <Card className="space-y-4 border-t-4 border-t-indigo-400">
            <h3 className="section-title">Recommendations</h3>
            {recommendations.map((option) => (
              <div key={option.antibioticName} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{option.antibioticName}</p>
                  <AwareBadge group={option.awareGroup} />
                </div>
                <div className="mt-3 grid gap-1 text-sm text-slate-700">
                  <p><strong>Dose:</strong> {option.doseText} ({option.route})</p>
                  <p><strong>Duration:</strong> {option.durationDaysRange[0]}–{option.durationDaysRange[1]} days</p>
                  <ul className="mt-1 list-disc pl-5 text-slate-600">
                    <li>{option.criteria}</li>
                    <li>Confirm indication and de-escalate when possible.</li>
                  </ul>
                  <div className="mt-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-teal-800">Review in 48–72h</div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
        <Card>
          <h3 className="text-base font-semibold">Case Summary</h3>
          <dl className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between gap-3"><dt>Patient</dt><dd>{form.age} y/o {form.sex}</dd></div>
            <div className="flex justify-between gap-3"><dt>Infection</dt><dd>{infections.find((it) => it.key === form.suspectedInfectionKey)?.label}</dd></div>
            <div className="flex justify-between gap-3"><dt>Setting</dt><dd>{form.setting.replace("_", " ")}</dd></div>
          </dl>
          <Button className="mt-5 w-full" onClick={submit} disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Recommendation</>}
          </Button>
          <Link href="/?tab=chat" className="mt-3 block">
            <Button variant="secondary" className="w-full"><MessageCircle className="h-4 w-4" /> Chat Assistant</Button>
          </Link>
          {caseId && <p className="mt-3 text-xs text-slate-500">Case ID: {caseId.slice(0, 8)}…</p>}
        </Card>
      </aside>
    </section>
  );
}
