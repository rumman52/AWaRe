import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOpenRouterChatCompletion, type ChatMessage } from "@/lib/openrouter";

export const runtime = "nodejs";

const PRIMARY_MODEL = "arcee-ai/trinity-large-preview:free";
const FALLBACK_MODEL = "arcee-ai/trinity-mini:free";
const DISCLAIMER = "Disclaimer: Educational only — not medical advice. Consult a clinician for clinical decisions.";

const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

type ChatMode = "case" | "general";

type ChatBody = {
  message?: string;
  mode?: ChatMode;
  caseId?: string;
  setting?: string;
  infectionKey?: string;
};

type CaseContext = {
  caseSummary: {
    age: number;
    sex: string;
    pregnancy: boolean;
    allergies: string;
    eGFR: string;
    setting: string;
    suspectedInfectionKey: string;
    notes: string;
    severity: string;
  };
  guide: {
    sourceUrl: string;
    summary: string;
    recommendedOptions: Array<{ name: string; dose?: string; duration?: string; route?: string; criteria?: string }>;
  };
  antibiotics: Array<{ name: string; awareGroup: string; notes: string }>;
  latestRecommendation?: {
    summaryText: string;
    reviewDueAt: string;
  };
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return false;
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function trimContext(raw: string, maxChars = 7800): string {
  if (raw.length <= maxChars) {
    return raw;
  }

  return `${raw.slice(0, maxChars)}\n...TRUNCATED_FOR_BREVITY`;
}

function getSystemPrompt(mode: ChatMode): string {
  if (mode === "case") {
    return [
      "You are AMR Steward Assistant for antibiotic stewardship decision support.",
      "Decision-support only: do not diagnose, prescribe, or provide definitive treatment plans.",
      "Use ONLY the provided context packet for antibiotic/case answers. Do not invent antibiotics, doses, or durations.",
      "If information is missing or uncertain, explicitly state what is missing.",
      "If asked for personal treatment or exact dosing instructions, refuse and advise a licensed clinician.",
      "If severe or emergency symptoms are described, advise urgent emergency care.",
      `Always append this exact disclaimer at the end: \"${DISCLAIMER}\"`
    ].join(" ");
  }

  return [
    "You are AMR Steward Assistant for antimicrobial resistance education.",
    "Provide educational information only and avoid personal medical advice.",
    "If asked for individual diagnosis, treatment, or dosing, refuse and advise consultation with a licensed clinician.",
    "If severe or emergency symptoms are described, advise urgent emergency care.",
    `Always append this exact disclaimer at the end: \"${DISCLAIMER}\"`
  ].join(" ");
}

async function buildCaseContext(input: { caseId?: string; setting?: string; infectionKey?: string }) {
  if (input.caseId) {
    const caseRecord = await prisma.case.findUnique({
      where: { id: input.caseId },
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

    const guideOptions = safeJsonParse<Array<Record<string, unknown>>>(guide.recommendedOptionsJson, []);
    const antibioticNames = guideOptions
      .map((option) => (typeof option.antibioticName === "string" ? option.antibioticName : ""))
      .filter(Boolean);

    const antibiotics = antibioticNames.length
      ? await prisma.antibiotic.findMany({
          where: { name: { in: antibioticNames } }
        })
      : [];

    const latestRecommendation = caseRecord.recommendations[0];
    const context: CaseContext = {
      caseSummary: {
        age: caseRecord.age,
        sex: caseRecord.sex,
        pregnancy: caseRecord.pregnancy,
        allergies: caseRecord.allergiesText || "none reported",
        eGFR: caseRecord.creatinineOrEgfr || "not provided",
        setting: caseRecord.setting,
        suspectedInfectionKey: caseRecord.suspectedInfectionKey,
        notes: caseRecord.symptomsText || caseRecord.justificationText || "none",
        severity: caseRecord.severity
      },
      guide: {
        sourceUrl: guide.sourceUrl,
        summary: `${guide.setting} / ${guide.infectionKey}`,
        recommendedOptions: guideOptions.map((option) => ({
          name: String(option.antibioticName ?? "unknown"),
          dose: typeof option.doseText === "string" ? option.doseText : undefined,
          duration: Array.isArray(option.durationDaysRange)
            ? `${String(option.durationDaysRange[0])}-${String(option.durationDaysRange[1])} days`
            : undefined,
          route: typeof option.route === "string" ? option.route : undefined,
          criteria: typeof option.criteria === "string" ? option.criteria : undefined
        }))
      },
      antibiotics: antibiotics.map((item) => ({
        name: item.name,
        awareGroup: item.awareGroup,
        notes: [item.notes, item.renalAdjustmentText].filter(Boolean).join(" | ")
      })),
      latestRecommendation: latestRecommendation
        ? {
            summaryText: latestRecommendation.summaryText,
            reviewDueAt: latestRecommendation.reviewDueAt.toISOString()
          }
        : undefined
    };

    return {
      context: trimContext(JSON.stringify(context))
    };
  }

  if (!input.setting || !input.infectionKey) {
    return { error: "invalid_case_context" as const };
  }

  const guide = await prisma.infectionGuide.findUnique({
    where: {
      infectionKey_setting: {
        infectionKey: input.infectionKey,
        setting: input.setting
      }
    }
  });

  if (!guide) {
    return { error: "no_guide" as const, setting: input.setting, infectionKey: input.infectionKey };
  }

  const guideOptions = safeJsonParse<Array<Record<string, unknown>>>(guide.recommendedOptionsJson, []);
  const context: CaseContext = {
    caseSummary: {
      age: -1,
      sex: "unknown",
      pregnancy: false,
      allergies: "unknown",
      eGFR: "unknown",
      setting: input.setting,
      suspectedInfectionKey: input.infectionKey,
      notes: "case details unavailable",
      severity: "unknown"
    },
    guide: {
      sourceUrl: guide.sourceUrl,
      summary: `${guide.setting} / ${guide.infectionKey}`,
      recommendedOptions: guideOptions.map((option) => ({
        name: String(option.antibioticName ?? "unknown"),
        dose: typeof option.doseText === "string" ? option.doseText : undefined,
        duration: Array.isArray(option.durationDaysRange)
          ? `${String(option.durationDaysRange[0])}-${String(option.durationDaysRange[1])} days`
          : undefined,
        route: typeof option.route === "string" ? option.route : undefined,
        criteria: typeof option.criteria === "string" ? option.criteria : undefined
      }))
    },
    antibiotics: [],
    latestRecommendation: undefined
  };

  return {
    context: trimContext(JSON.stringify(context))
  };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const body = (await req.json()) as ChatBody;
    const message = body.message?.trim();
    const mode: ChatMode = body.mode === "case" ? "case" : "general";

    if (!message) {
      return NextResponse.json({ error: "invalid_message" }, { status: 400 });
    }

    const messages: ChatMessage[] = [{ role: "system", content: getSystemPrompt(mode) }];

    if (mode === "case") {
      const contextResult = await buildCaseContext({
        caseId: body.caseId,
        setting: body.setting,
        infectionKey: body.infectionKey
      });

      if ("error" in contextResult) {
        if (contextResult.error === "no_guide") {
          return NextResponse.json(
            { error: "no_guide", setting: contextResult.setting, infectionKey: contextResult.infectionKey },
            { status: 400 }
          );
        }

        return NextResponse.json({ error: contextResult.error }, { status: 400 });
      }

      messages.push({ role: "system", content: `CONTEXT_JSON:\n${contextResult.context}` });
    }


    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "missing_openrouter_key" }, { status: 500 });
    }

    messages.push({ role: "user", content: message });

    let answer = "";
    try {
      answer = await createOpenRouterChatCompletion({
        apiKey,
        model: PRIMARY_MODEL,
        messages,
        reasoning: { enabled: true },
        temperature: 0.2,
        maxTokens: 600
      });
    } catch (primaryError) {
      console.warn("[POST /api/chat] primary model failed, using fallback", {
        code: "primary_model_failed",
        mode
      });

      answer = await createOpenRouterChatCompletion({
        apiKey,
        model: FALLBACK_MODEL,
        messages,
        reasoning: { enabled: true },
        temperature: 0.2,
        maxTokens: 600
      });

      if (primaryError instanceof Error) {
        console.warn("[POST /api/chat] primary model error summary", {
          message: primaryError.message.slice(0, 120)
        });
      }
    }

    const finalAnswer = answer.includes(DISCLAIMER) ? answer : `${answer}\n\n${DISCLAIMER}`;
    const durationMs = Date.now() - startedAt;
    console.info("[POST /api/chat] success", { mode, durationMs });

    return NextResponse.json({ answer: finalAnswer });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error("[POST /api/chat] failed", {
      mode: "unknown",
      durationMs,
      code: "internal_error",
      message: error instanceof Error ? error.message : "unknown_error"
    });

    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
