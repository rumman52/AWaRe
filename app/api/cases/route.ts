import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma, getDatabaseConfigError } from "@/lib/prisma";
import { generateRecommendation, renderRationale } from "@/lib/recommendation-engine";

export const runtime = "nodejs";

function mapRecommendationError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database connection failed. Verify DATABASE_URL and network access to your Postgres instance.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return "Database schema is missing required tables. Run `npx prisma migrate deploy` and `npx prisma db seed`.";
    }

    if (error.code === "P2022") {
      return "Database schema is out of date (missing columns). Run `npx prisma migrate deploy` to apply latest migrations.";
    }
  }

  if (error instanceof SyntaxError) {
    return "Guide configuration is invalid JSON. Re-seed guide data with `npx prisma db seed`.";
  }

  return "Failed to generate recommendation. Verify DATABASE_URL and that migrations are applied.";
}

export async function POST(req: NextRequest) {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    console.error("[POST /api/cases] DATABASE_URL validation failed:", databaseConfigError);
    return NextResponse.json({ error: databaseConfigError }, { status: 500 });
  }

  try {
    const body = await req.json();
    const guide = await prisma.infectionGuide.findUnique({
      where: {
        infectionKey_setting: {
          infectionKey: body.suspectedInfectionKey,
          setting: body.setting
        }
      }
    });

    if (!guide) {
      return NextResponse.json(
        { error: "No guide found for infection/setting. Seed baseline data with `npx prisma db seed`." },
        { status: 404 }
      );
    }

    const antibiotics = await prisma.antibiotic.findMany();
    const recommendation = generateRecommendation({
      guide,
      antibiotics,
      severity: body.severity,
      chosenAntibiotic: body.chosenAntibiotic,
      chosenDurationDays: body.chosenDurationDays
    });

    const caseRecord = await prisma.case.create({
      data: {
        age: Number(body.age),
        sex: body.sex,
        pregnancy: Boolean(body.pregnancy),
        allergiesText: body.allergiesText || "",
        creatinineOrEgfr: body.creatinineOrEgfr || "",
        setting: body.setting,
        suspectedInfectionKey: body.suspectedInfectionKey,
        severity: body.severity,
        symptomsText: body.symptomsText || "",
        chosenAntibiotic: body.chosenAntibiotic || null,
        chosenDose: body.chosenDose || null,
        chosenDurationDays: body.chosenDurationDays ? Number(body.chosenDurationDays) : null,
        justificationText: body.justificationText || "Clinician confirmation pending"
      }
    });

    const rationale = renderRationale({
      infection: body.suspectedInfectionKey,
      severity: body.severity,
      options: recommendation.suggested.map((item) => item.antibioticName)
    });

    await prisma.recommendation.create({
      data: {
        caseId: caseRecord.id,
        summaryText: `${recommendation.summaryText} ${rationale}`,
        suggestedRegimensJson: JSON.stringify(recommendation.suggested),
        awareWarningsJson: JSON.stringify(recommendation.warnings),
        durationWarningJson: JSON.stringify({ message: recommendation.durationWarning }),
        reviewDueAt: recommendation.reviewDueAt,
        evidenceLinksJson: JSON.stringify(recommendation.evidenceLinks)
      }
    });

    await prisma.auditLog.create({
      data: {
        caseId: caseRecord.id,
        actionType: "CASE_CREATED",
        detailJson: JSON.stringify({ actor: "demo-user", source: guide.sourceUrl })
      }
    });

    return NextResponse.json({ id: caseRecord.id });
  } catch (error) {
    console.error("[POST /api/cases] Failed to generate recommendation:", error);
    return NextResponse.json({ error: mapRecommendationError(error) }, { status: 500 });
  }
}
