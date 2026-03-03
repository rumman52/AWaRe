"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
import { SourceBadge } from "@/components/source-badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";

const infections = [
  { key: "uti_uncomplicated", label: "UTI - uncomplicated" },
  { key: "uti_complicated", label: "UTI - complicated" },
  { key: "cap_mild", label: "Community-acquired pneumonia - mild" },
  { key: "cap_severe", label: "Community-acquired pneumonia - severe" },
  { key: "ssti", label: "Skin/soft tissue infection" }
];

export default function NewCasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseId, setCaseId] = useState("");
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
    } catch {
      setError("We couldn't reach the recommendation service. Please retry in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <h2 className="section-title">Create stewardship case</h2>
            <p className="mt-2 text-sm text-slate-600">Capture patient context first, then generate AWaRe-aligned recommendations for clinician review.</p>
          </Card>

          <Card>
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

          <Card>
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
                <p className="field-help">List reaction details if known to support safe substitutions.</p>
              </label>
              <label>
                <span className="field-label">Renal function (eGFR / creatinine)</span>
                <Input value={form.creatinineOrEgfr} onChange={(e) => setForm({ ...form, creatinineOrEgfr: e.target.value })} placeholder="eGFR 88 mL/min" />
                <p className="field-help">Renal impairment may require dose or interval adjustment.</p>
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.pregnancy} onChange={(e) => setForm({ ...form, pregnancy: e.target.checked })} />
                Pregnancy
              </label>
            </div>
          </Card>

          {error && <Alert tone="error">{error}</Alert>}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:h-fit">
          <Card>
            <h3 className="text-base font-semibold">Case summary</h3>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-3"><dt>Patient</dt><dd>{form.age} y/o {form.sex}</dd></div>
              <div className="flex justify-between gap-3"><dt>Infection</dt><dd>{infections.find((it) => it.key === form.suspectedInfectionKey)?.label}</dd></div>
              <div className="flex justify-between gap-3"><dt>Setting</dt><dd>{form.setting.replace("_", " ")}</dd></div>
              <div className="flex justify-between gap-3"><dt>Risk flags</dt><dd>{form.pregnancy ? "Pregnancy" : "None"}</dd></div>
            </dl>
            <Button className="mt-5 w-full" onClick={submit} disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Recommendation</>}
            </Button>
            <Link href="/chat" className="mt-3 block">
              <Button variant="secondary" className="w-full">
                <MessageCircle className="h-4 w-4" /> Chat Assistant
              </Button>
            </Link>
          </Card>

          {caseId && (
            <Alert tone="success" className="space-y-2">
              <p className="font-semibold">Recommendation generated successfully.</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/case/${caseId}`}><Button size="sm">View recommendation</Button></Link>
                <Link href={`/chat?caseId=${caseId}`}><Button size="sm" variant="secondary">Ask about this case</Button></Link>
              </div>
            </Alert>
          )}
        </aside>
      </section>

      <SourceBadge citation="WHO AWaRe guidance + CDC Core Elements" href="https://aware.essentialmeds.org/" />
    </main>
  );
}
