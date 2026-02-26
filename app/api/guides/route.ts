import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const guides = await prisma.infectionGuide.findMany({ orderBy: [{ infectionKey: "asc" }, { setting: "asc" }] });
  return NextResponse.json(guides);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const updated = await prisma.infectionGuide.update({
    where: { id: body.id },
    data: {
      recommendedOptionsJson: body.recommendedOptionsJson,
      durationRulesJson: body.durationRulesJson,
      redFlagsJson: body.redFlagsJson,
      sourceUrl: body.sourceUrl
    }
  });

  return NextResponse.json(updated);
}
