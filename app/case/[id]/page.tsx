import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle, Clock3, Stethoscope } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AwareBadge } from "@/components/ui/AwareBadge";
import { SourceBadge } from "@/components/source-badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
  const hasWatchOrReserve = options.some((option) => option.awareGroup !== "ACCESS");

  return (
    <main className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Case summary</h2>
            <p className="mt-2 text-sm text-slate-600">{caseData.age} y/o {caseData.sex} · {caseData.setting.replace("_", " ")} · {caseData.severity}</p>
          </div>
          <AwareBadge group={options[0]?.awareGroup ?? "ACCESS"} />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          <p><strong>Infection:</strong> {caseData.suspectedInfectionKey}</p>
          <p><strong>Renal:</strong> {caseData.creatinineOrEgfr}</p>
          <p><strong>Allergies:</strong> {caseData.allergiesText || "None reported"}</p>
          <p className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> Review due: {format(rec.reviewDueAt, "PPpp")}</p>
        </div>
        <Link href={`/chat?caseId=${caseData.id}`} className="mt-4 inline-block"><Button>Ask assistant about this case</Button></Link>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold">Recommended regimens</h3>
            <p className="mt-1 text-sm text-slate-600">Clinician confirmation is required before prescribing or modifying treatment.</p>
            <div className="mt-4 space-y-3">
              {options.map((option) => (
                <div key={option.antibioticName} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold">{option.antibioticName}</p>
                    <AwareBadge group={option.awareGroup} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <p><strong>Dose:</strong> {option.doseText} via {option.route}</p>
                    <p><strong>Duration:</strong> {option.durationDaysRange[0]}-{option.durationDaysRange[1]} days</p>
                    <ul className="list-disc space-y-1 pl-5 text-slate-600">
                      {[option.criteria, `Use route: ${option.route}`, `AWaRe group: ${option.awareGroup}`].slice(0, 3).map((note) => <li key={note}>{note}</li>)}
                    </ul>
                    <Button size="sm" variant="secondary" className="w-fit">Select</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {hasWatchOrReserve && (
            <Alert tone="warning" className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p>Use cautiously; consider Access alternatives when appropriate.</p>
            </Alert>
          )}

          {(warnings.length > 0 || durationWarning.message) && (
            <Alert tone="error">
              <h3 className="font-semibold">Safety warnings</h3>
              {warnings.map((warning) => <p key={warning}>• {warning}</p>)}
              {durationWarning.message && <p>• {durationWarning.message}</p>}
            </Alert>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">AWaRe legend</h4>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="space-y-1"><AwareBadge group="ACCESS" /><p>Preferred narrow-spectrum options when suitable.</p></li>
              <li className="space-y-1"><AwareBadge group="WATCH" /><p>Monitor closely for resistance and indication.</p></li>
              <li className="space-y-1"><AwareBadge group="RESERVE" /><p>Use only for highly selected severe situations.</p></li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-base font-semibold">Guideline sources</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((link) => (
                <SourceBadge key={link.url} citation={link.citation} href={link.url} />
              ))}
            </div>
          </Card>
        </div>
      </section>

      <p className="inline-flex items-center gap-2 text-xs text-slate-500"><Stethoscope className="h-3.5 w-3.5" /> Educational support only; clinician judgment required.</p>
    </main>
  );
}
