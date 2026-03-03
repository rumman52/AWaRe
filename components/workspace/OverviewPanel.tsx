import { ArrowRight, MessageCircle, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function OverviewPanel({ onStartNewCase, onOpenChat }: { onStartNewCase: () => void; onOpenChat: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <Button className="w-full sm:w-auto" onClick={onStartNewCase}>
          Start New Case <ArrowRight className="h-4 w-4" />
        </Button>
        <Button className="w-full sm:w-auto" variant="secondary" onClick={onOpenChat}>
          <MessageCircle className="h-4 w-4" /> Open Chat
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <Stethoscope className="h-4 w-4 text-indigo-600" /> What it is
          </p>
          <p className="mt-2 text-sm text-slate-600">A focused stewardship workspace that translates guideline logic into practical recommendations with transparent AWaRe grouping.</p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <Users className="h-4 w-4 text-teal-600" /> Who it helps
          </p>
          <p className="mt-2 text-sm text-slate-600">Clinicians, antimicrobial stewardship teams, and trainees who need a fast structure for case review and decision documentation.</p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-rose-500" /> What you get
          </p>
          <p className="mt-2 text-sm text-slate-600">Case-specific options, dose and duration guidance, AWaRe pill badges, and a built-in 48–72h review cue to support de-escalation thinking.</p>
        </Card>
      </section>

      <Card className="border-indigo-100 bg-indigo-50 p-4 text-center text-sm text-indigo-900">
        <p className="font-semibold">Made by The AI Fixers</p>
        <p className="mt-1 text-indigo-700">All rights reserved.</p>
      </Card>
    </div>
  );
}
