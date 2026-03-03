import { ArrowRight, MessageCircle, ShieldCheck, Tags, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function OverviewPanel({ onStartNewCase, onOpenChat }: { onStartNewCase: () => void; onOpenChat: () => void }) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-gradient-to-r from-teal-50 via-white to-indigo-50 p-6">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">AMR Steward</h2>
        <p className="mt-2 text-lg text-slate-600">Guideline-based antibiotic decision support aligned with WHO AWaRe.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={onStartNewCase}>
            Start New Case <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={onOpenChat}>
            <MessageCircle className="h-4 w-4" /> Open Chat Assistant
          </Button>
        </div>
      </section>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">How it works</h3>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            "Enter case details",
            "Generate guideline options",
            "Review AWaRe + safety notes (48–72h reminder)"
          ].map((step, idx) => (
            <li key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold text-indigo-600">Step {idx + 1}</p>
              <p className="mt-1 font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">What you get</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="flex items-center gap-2 font-semibold text-slate-900"><Tags className="h-4 w-4 text-indigo-600" />AWaRe labels</p>
            <p className="mt-2 text-sm text-slate-600">Clear Access / Watch / Reserve tagging for each option.</p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-semibold text-slate-900"><ShieldCheck className="h-4 w-4 text-teal-600" />Safety checks</p>
            <p className="mt-2 text-sm text-slate-600">Flag allergy, renal, and pregnancy considerations before selection.</p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 font-semibold text-slate-900"><TimerReset className="h-4 w-4 text-rose-500" />Review reminder (48–72h)</p>
            <p className="mt-2 text-sm text-slate-600">Built-in reminder to reassess indication and de-escalation opportunities.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
