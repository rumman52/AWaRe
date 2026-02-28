// app/api/chat/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if your prisma client path differs

type Body = {
message: string;
mode?: "case" | "general";
caseId?: string;
setting?: string;
infectionKey?: string;
};

// Simple in-memory rate limit (demo)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 40;
const ipStore = new Map<string, { ts: number; count: number }>();

function checkRateLimit(ip: string) {
const now = Date.now();
const rec = ipStore.get(ip);
if (!rec) { ipStore.set(ip, { ts: now, count: 1 }); return true; }
if (now - rec.ts > RATE_LIMIT_WINDOW) { ipStore.set(ip, { ts: now, count: 1 }); return true; }
if (rec.count >= RATE_LIMIT_MAX) return false;
rec.count += 1; ipStore.set(ip, rec); return true;
}

function makeSystemPrompt(mode: "case" | "general") {
const base = [
 "You are an assistant embedded in AMR Steward (clinical decision support demo).",
 "You MUST NOT diagnose, prescribe, or give individualized dosing.",
 "If asked for personal treatment, refuse and advise consulting a clinician.",
 "If severe symptoms described, advise urgent or emergency care.",
 "Keep answers concise, professional, and include the disclaimer at the end."
];
if (mode === "case") {
 base.push("For antibiotic/case-specific answers: USE ONLY THE PROVIDED CONTEXT_JSON and do NOT invent antibiotics, doses, or durations. If info is missing say what's missing.");
} else {
 base.push("Answer general AMR/antibiotic questions educationally, without personal medical advice.");
}
return base.join(" ");
}

async function callOpenRouter(messages: { role: string; content: string }[]) {
const key = process.env.OPENROUTER_API_KEY;
if (!key) throw new Error("OPENROUTER_API_KEY not set on server");

const body = {
 model: "arcee-ai/trinity-large-preview:free",
 messages,
 temperature: 0.2,
 max_tokens: 600,
 reasoning: { enabled: true }
};

const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
 method: "POST",
 headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
 body: JSON.stringify(body),
});
if (!r.ok) {
 const txt = await r.text();
 throw new Error(`OpenRouter error ${r.status}: ${txt}`);
}
const d = await r.json();
// extract assistant text only (no reasoning_details)
const content = d?.choices?.[0]?.message?.content ?? d?.choices?.[0]?.text ?? "";
return String(content);
}

export async function POST(req: NextRequest) {
try {
 const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
 if (!checkRateLimit(String(ip))) {
   return NextResponse.json({ error: "rate_limited" }, { status: 429 });
 }

 const body = (await req.json()) as Body;
 const mode = body.mode ?? (body.caseId ? "case" : "general");

 const messages: { role: string; content: string }[] = [{ role: "system", content: makeSystemPrompt(mode) }];

 if (mode === "case") {
   if (!body.caseId && !(body.setting && body.infectionKey)) {
     return NextResponse.json({ error: "missing_case_identifiers" }, { status: 400 });
   }
   // fetch case
   const theCase = body.caseId ? await prisma.case.findUnique({
     where: { id: body.caseId },
     include: { recommendations: { orderBy: { createdAt: "desc" }, take: 1 } }
   }) : null;

   const setting = theCase?.setting ?? body.setting;
   const infectionKey = theCase?.suspectedInfectionKey ?? body.infectionKey;

   // load guide
   const guide = await prisma.infectionGuide.findUnique({
     where: { setting_suspectedInfectionKey: { setting, suspectedInfectionKey: infectionKey } }
   }).catch(() => null);

   if (!guide) {
     return NextResponse.json({ error: "no_guide", setting, infectionKey }, { status: 400 });
   }

   // load antibiotics referenced by the guide (assumes recommendedOptionsJson array of {name,...})
   let antibiotics = [];
   try {
     const recommended = JSON.parse(guide.recommendedOptionsJson || "[]") as { name: string }[];
     const names = recommended.map(r => r.name);
     antibiotics = await prisma.antibiotic.findMany({ where: { name: { in: names } } });
   } catch {
     antibiotics = [];
   }

   const context = {
     case: {
       id: theCase?.id ?? null, setting, suspectedInfectionKey: infectionKey,
       age: theCase?.age ?? null, sex: theCase?.sex ?? null, pregnancy: theCase?.pregnancy ?? null,
       allergies: theCase?.allergiesText ?? null, egfr: theCase?.creatinineOrEgfr ?? null, notes: theCase?.symptomsText ?? null
     },
     guide: {
       summary: guide.summary ?? null,
       recommendedOptions: guide.recommendedOptionsJson ? JSON.parse(guide.recommendedOptionsJson) : []
     },
     antibiotics,
     latestRecommendation: theCase?.recommendations?.[0] ?? null
   };

   messages.push({ role: "system", content: `CONTEXT_JSON:\n${JSON.stringify(context)}` });
 }

 messages.push({ role: "user", content: body.message });

 const answer = await callOpenRouter(messages);
 const disclaimer = "\n\nDisclaimer: Educational only — not medical advice. Consult a clinician.";
 return NextResponse.json({ answer: answer + disclaimer });
} catch (err: unknown) {
 console.error("chat route error", err);
 const message = err instanceof Error ? err.message : "server_error";
 return NextResponse.json({ error: message }, { status: 500 });
}
}
