import { NextRequest, NextResponse } from "next/server";
import { prisma, getDatabaseConfigError } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    console.error("[GET /api/guides] DATABASE_URL validation failed:", databaseConfigError);
    return NextResponse.json({ error: databaseConfigError }, { status: 500 });
  }

  try {
    const guides = await prisma.infectionGuide.findMany({ orderBy: [{ infectionKey: "asc" }, { setting: "asc" }] });
    return NextResponse.json(guides);
  } catch (error) {
    console.error("[GET /api/guides] Failed to load guides:", error);
    return NextResponse.json({ error: "Failed to load guides." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    console.error("[PATCH /api/guides] DATABASE_URL validation failed:", databaseConfigError);
    return NextResponse.json({ error: databaseConfigError }, { status: 500 });
  }

  try {
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
  } catch (error) {
    console.error("[PATCH /api/guides] Failed to update guide:", error);
    return NextResponse.json({ error: "Failed to update guide." }, { status: 500 });
  }
}
