import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { SourceBadge } from "@/components/source-badge";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseData = await prisma.case.findUnique({ where: { id }, include: { recommendations: true } });
  if (!caseData || !caseData.recommendations[0]) return notFound();

  const rec = caseData.recommendations[0];
  const options = JSON.parse(rec.suggestedRegimensJson) as Array<{
    antibioticName: string;
    awareGroup: "ACCESS" | "WATCH" | "RESERVE";
    doseText: string;
    durationDaysRange: [number, number];
    route: string;
    criteria: string;
  }>;
  const warnings = JSON.parse(rec.awareWarningsJson) as string[];
  const durationWarning = JSON.parse(rec.durationWarningJson) as { message?: string };
  const links = JSON.parse(rec.evidenceLinksJson) as Array<{ title: string; url: string; citation: string }>;

  return (
    <main className="space-y-4">
      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">Case summary</h2>
        <p className="text-sm">Infection: {caseData.suspectedInfectionKey} | Setting: {caseData.setting} | Severity: {caseData.severity}</p>
        <p className="text-sm">Patient: {caseData.age} y/o {caseData.sex}; renal: {caseData.creatinineOrEgfr}; allergies: {caseData.allergiesText || "none reported"}</p>
        <p className="mt-2 text-sm font-medium">Review due: {format(rec.reviewDueAt, "PPpp")}</p>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Set review reminder in 48-72h</label>
      </section>

      <section className="card">
        <h3 className="mb-2 font-semibold">Recommended regimens (clinician must confirm)</h3>
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.antibioticName} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold">{option.antibioticName} <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{option.awareGroup}</span></p>
              <p className="text-sm">Dose: {option.doseText} via {option.route}</p>
              <p className="text-sm">Duration: {option.durationDaysRange[0]}-{option.durationDaysRange[1]} days</p>
              <p className="text-xs text-slate-600">Use when: {option.criteria}</p>
            </div>
          ))}
        </div>
      </section>

      {(warnings.length > 0 || durationWarning.message) && (
        <section className="card border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-900">Safety warnings</h3>
          {warnings.map((warning) => <p key={warning} className="text-sm text-red-800">• {warning}</p>)}
          {durationWarning.message && <p className="text-sm text-red-800">• {durationWarning.message}</p>}
        </section>
      )}

      <section className="card">
        <h3 className="mb-2 font-semibold">Guideline sources</h3>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <SourceBadge key={link.url} citation={link.citation} href={link.url} />
          ))}
        </div>
      </section>
    </main>
  );
}
