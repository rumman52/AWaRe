"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SourceBadge } from "@/components/source-badge";

const infections = [
  { key: "uti_uncomplicated", label: "UTI - uncomplicated" },
  { key: "uti_complicated", label: "UTI - complicated" },
  { key: "cap_mild", label: "Community-acquired pneumonia - mild" },
  { key: "cap_severe", label: "Community-acquired pneumonia - severe" },
  { key: "ssti", label: "Skin/soft tissue infection" }
];

export default function NewCasePage() {
  const router = useRouter();
  const [error, setError] = useState("");
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

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload?.error || "Failed to generate recommendation.";
        const code = payload?.code ? ` (code: ${payload.code})` : "";
        setError(`${message}${code}`);
        return;
      }

      const data = await res.json();
      router.push(`/case/${data.id}`);
    } catch {
      setError("Failed to generate recommendation. Please try again.");
    }
  };

  return (
    <main className="space-y-4">
      <section className="card border-blue-200 bg-blue-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">Need the chat assistant?</h2>
            <p className="text-sm text-blue-800">Use general mode for health education, or open case-grounded mode from a case details page.</p>
          </div>
          <Link href="/chat" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Open chatbox</Link>
        </div>
      </section>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Create stewardship case</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="label">Setting</span>
            <select className="input" value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })}>
              <option value="primary_care">Primary care</option>
              <option value="hospital">Hospital</option>
            </select>
          </label>
          <label>
            <span className="label">Infection</span>
            <select
              className="input"
              value={form.suspectedInfectionKey}
              onChange={(e) => setForm({ ...form, suspectedInfectionKey: e.target.value })}
            >
              {infections.map((item) => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
          </label>
          <label><span className="label">Severity</span><select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option value="uncomplicated">Uncomplicated</option><option value="complicated">Complicated</option><option value="severe">Severe</option></select></label>
          <label><span className="label">Age</span><input className="input" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} /></label>
          <label><span className="label">Sex</span><input className="input" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })} /></label>
          <label className="flex items-center gap-2 pt-7"><input type="checkbox" checked={form.pregnancy} onChange={(e) => setForm({ ...form, pregnancy: e.target.checked })} />Pregnancy</label>
          <label><span className="label">Allergies</span><input className="input" value={form.allergiesText} onChange={(e) => setForm({ ...form, allergiesText: e.target.value })} /></label>
          <label><span className="label">Kidney function</span><input className="input" value={form.creatinineOrEgfr} onChange={(e) => setForm({ ...form, creatinineOrEgfr: e.target.value })} /></label>
          <label><span className="label">Clinician-selected antibiotic (optional)</span><input className="input" value={form.chosenAntibiotic} onChange={(e) => setForm({ ...form, chosenAntibiotic: e.target.value })} /></label>
          <label><span className="label">Clinician-selected dose</span><input className="input" value={form.chosenDose} onChange={(e) => setForm({ ...form, chosenDose: e.target.value })} /></label>
          <label><span className="label">Clinician-selected duration (days)</span><input className="input" type="number" value={form.chosenDurationDays} onChange={(e) => setForm({ ...form, chosenDurationDays: Number(e.target.value) })} /></label>
          <label><span className="label">Notes/symptoms</span><textarea className="input min-h-24" value={form.symptomsText} onChange={(e) => setForm({ ...form, symptomsText: e.target.value })} /></label>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={submit} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Generate recommendation</button>
          <p className="text-xs text-slate-600">Human confirmation required before any order changes.</p>
        </div>
        {error && <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-800">{error}</p>}
      </div>
      <SourceBadge citation="WHO AWaRe guidance + CDC Core Elements" href="https://aware.essentialmeds.org/" />
    </main>
  );
}
