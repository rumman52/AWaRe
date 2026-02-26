import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const metrics = await prisma.metricDaily.findMany({ orderBy: { date: "asc" } });
  const recommendations = await prisma.recommendation.findMany({ include: { case: true }, orderBy: { createdAt: "desc" } });

  const topWatch: Record<string, number> = {};
  recommendations.forEach((rec) => {
    const options = JSON.parse(rec.suggestedRegimensJson) as Array<{ antibioticName: string; awareGroup: string }>;
    options
      .filter((opt) => opt.awareGroup === "WATCH")
      .forEach((opt) => {
        topWatch[opt.antibioticName] = (topWatch[opt.antibioticName] || 0) + 1;
      });
  });

  const reviewOverdue = recommendations
    .filter((rec) => new Date(rec.reviewDueAt).getTime() < Date.now())
    .map((rec) => ({ caseId: rec.caseId, reviewDueAt: rec.reviewDueAt, infection: rec.case.suspectedInfectionKey }));

  return NextResponse.json({
    metrics,
    topWatch: Object.entries(topWatch)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    reviewOverdue
  });
}
