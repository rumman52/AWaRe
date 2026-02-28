import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MODEL = "arcee-ai/trinity-large-preview:free";
const DISCLAIMER = "Disclaimer: Educational only — not medical advice. Consult a clinician for clinical decisions.";

const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

type ChatMode = "case" | "general";

type ChatRequestBody = {
  message?: string;
  mode?: ChatMode;
  caseId?: string;
};

type GuideOption = {
  antibioticName?: unknown;
  doseText?: unknown;
  durationDaysRange?: unknown;
  route?: unknown;
  criteria?: unknown;
};

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  return forwarded || realIp || cfIp || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return true;
  }

  existing.count += 1;
  rateLimitStore.set(ip, existing);
  return false;
}

function parseGuideOptions(raw: string): GuideOption[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GuideOption[]) : [];
  } catch {
    return [];
  }
}

function buildSystemPrompt(mode: ChatMode): string {
  if (mode === "case") {
    return [
      "You are an antimicrobial stewardship educational assistant.",
      "No diagnosis, no prescribing, and no dosing for individuals.",
      "If user asks what antibiotic they should take, refuse and advise seeing a licensed clinician.",
      "In case mode, use only CONTEXT_JSON and never invent antibiotics, regimens, or doses.",
      "Be concise, practical, and safety-first."
    ].join(" ");
  }

  return [
    "You are an antimicrobial stewardship educational assistant.",
    "No diagnosis, no prescribing, and no dosing for individuals.",
    "If user asks what antibiotic they should take, refuse and advise seeing a licensed clinician.",
    "Provide only general health education and stewardship information."
  ].join(" ");
}

async function buildCaseContext(caseId: string) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      recommendations: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!caseRecord) {
    return { error: "case_not_found" as const };
  }

  const setting = caseRecord.setting;
  const infectionKey = caseRecord.suspectedInfectionKey;

  const guide = await prisma.infectionGuide.findUnique({
    where: {
      infectionKey_setting: {
        infectionKey,
        setting
      }
    }
  });

  if (!guide) {
    return { error: "no_guide" as const, setting, infectionKey };
  }

  const options = parseGuideOptions(guide.recommendedOptionsJson);
  const antibioticNames = Array.from(
    new Set(
      options
        .map((option) => (typeof option.antibioticName === "string" ? option.antibioticName : ""))
        .filter(Boolean)
    )
  );

  const antibiotics =
    antibioticNames.length > 0
      ? await prisma.antibiotic.findMany({
          where: { name: { in: antibioticNames } }
        })
      : [];

  const latestRecommendation = caseRecord.recommendations[0];

  const context = {
    caseSummary: {
      id: caseRecord.id,
      createdAt: caseRecord.createdAt.toISOString(),
      age: caseRecord.age,
      sex: caseRecord.sex,
      pregnancy: caseRecord.pregnancy,
      allergiesText: caseRecord.allergiesText,
      creatinineOrEgfr: caseRecord.creatinineOrEgfr,
      setting: caseRecord.setting,
      suspectedInfectionKey: caseRecord.suspectedInfectionKey,
      severity: caseRecord.severity,
      symptomsText: caseRecord.symptomsText,
      chosenAntibiotic: caseRecord.chosenAntibiotic,
      chosenDose: caseRecord.chosenDose,
      chosenDurationDays: caseRecord.chosenDurationDays,
      justificationText: caseRecord.justificationText
    },
    guide: {
      infectionKey: guide.infectionKey,
      setting: guide.setting,
      sourceUrl: guide.sourceUrl,
      recommendedOptions: options.map((option) => ({
        antibioticName: typeof option.antibioticName === "string" ? option.antibioticName : "unknown",
        doseText: typeof option.doseText === "string" ? option.doseText : undefined,
        durationDaysRange: Array.isArray(option.durationDaysRange) ? option.durationDaysRange : undefined,
        route: typeof option.route === "string" ? option.route : undefined,
        criteria: typeof option.criteria === "string" ? option.criteria : undefined
      }))
    },
    awareAntibiotics: antibiotics.map((abx) => ({
      name: abx.name,
      awareGroup: abx.awareGroup,
      notes: abx.notes,
      renalAdjustmentText: abx.renalAdjustmentText,
      adultDoseText: abx.adultDoseText,
      sourceUrl: abx.sourceUrl
    })),
    latestRecommendation: latestRecommendation
      ? {
          summaryText: latestRecommendation.summaryText,
          reviewDueAt: latestRecommendation.reviewDueAt.toISOString()
        }
      : null
  };

  return { contextJson: JSON.stringify(context) };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_openrouter_key" }, { status: 500 });
  }

  try {
    const body = (await req.json()) as ChatRequestBody;
    const message = body.message?.trim();
    const mode: ChatMode = body.mode === "case" ? "case" : "general";

    if (!message) {
      return NextResponse.json({ error: "invalid_message" }, { status: 400 });
    }

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: buildSystemPrompt(mode) }
    ];

    if (mode === "case") {
      if (!body.caseId) {
        return NextResponse.json({ error: "missing_case_id" }, { status: 400 });
      }

      const caseContext = await buildCaseContext(body.caseId);

      if ("error" in caseContext) {
        if (caseContext.error === "no_guide") {
          return NextResponse.json(
            {
              error: "no_guide",
              setting: caseContext.setting,
              infectionKey: caseContext.infectionKey
            },
            { status: 400 }
          );
        }

        return NextResponse.json({ error: caseContext.error }, { status: 400 });
      }

      messages.push({ role: "system", content: `CONTEXT_JSON:\n${caseContext.contextJson}` });
    }

    messages.push({ role: "user", content: message });

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 600,
        reasoning: { enabled: true }
      })
    });

    if (!openRouterResponse.ok) {
      const details = await openRouterResponse.text();
      console.error("[POST /api/chat] OpenRouter error", {
        status: openRouterResponse.status,
        details: details.slice(0, 500)
      });
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }

    const payload = (await openRouterResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer = payload.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json({ error: "invalid_upstream_payload" }, { status: 502 });
    }

    const finalAnswer = answer.includes(DISCLAIMER) ? answer : `${answer}\n\n${DISCLAIMER}`;

    return NextResponse.json({ answer: finalAnswer });
  } catch (error) {
    console.error("[POST /api/chat] internal_error", {
      message: error instanceof Error ? error.message : "unknown"
    });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
