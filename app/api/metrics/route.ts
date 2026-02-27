import { NextResponse } from "next/server";
import { prisma, getDatabaseConfigError } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    console.error("[GET /api/metrics] DATABASE_URL validation failed:", databaseConfigError);
    return NextResponse.json({ error: databaseConfigError }, { status: 500 });
  }

  try {
    const metrics = await prisma.metricDaily.findMany({ orderBy: { date: "asc" } });
    const recommendations = await prisma.recommendation.findMany({ include: { case: true }, orderBy: { createdAt: "desc" } });
    const antibiotics: Array<{ name: string; awareGroup: string }> = await prisma.antibiotic.findMany({
      select: { name: true, awareGroup: true }
    });

    const awareByAntibiotic = new Map<string, string>();
    for (const antibiotic of antibiotics) {
      awareByAntibiotic.set(antibiotic.name, antibiotic.awareGroup);
    }

    const topWatch: Record<string, number> = {};
    for (const recommendation of recommendations) {
      const selectedAntibiotic = recommendation.case.chosenAntibiotic;

      if (!selectedAntibiotic) {
        continue;
      }

      if (awareByAntibiotic.get(selectedAntibiotic) === "WATCH") {
        topWatch[selectedAntibiotic] = (topWatch[selectedAntibiotic] || 0) + 1;
      }
    }

    const reviewOverdue: Array<{ caseId: string; reviewDueAt: Date; infection: string }> = [];
    for (const recommendation of recommendations) {
      if (new Date(recommendation.reviewDueAt).getTime() < Date.now()) {
        reviewOverdue.push({
          caseId: recommendation.caseId,
          reviewDueAt: recommendation.reviewDueAt,
          infection: recommendation.case.suspectedInfectionKey
        });
      }
    }

    return NextResponse.json({
      metrics,
      topWatch: Object.entries(topWatch)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      reviewOverdue
    });
  } catch (error) {
    console.error("[GET /api/metrics] Failed to load metrics:", error);
    return NextResponse.json({ error: "Failed to load metrics." }, { status: 500 });
  }
}
