import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseData = await prisma.case.findUnique({ where: { id }, include: { recommendations: true } });

  if (!caseData || !caseData.recommendations[0]) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    id: caseData.id,
    age: caseData.age,
    sex: caseData.sex,
    setting: caseData.setting,
    severity: caseData.severity,
    suspectedInfectionKey: caseData.suspectedInfectionKey,
    pregnancy: caseData.pregnancy,
    recommendation: caseData.recommendations[0]
  });
}
