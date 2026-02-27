import { NextResponse } from "next/server";
import { prisma, getDatabaseConfigError } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    return NextResponse.json({ ok: false, status: "FAIL", error: databaseConfigError }, { status: 500 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, status: "OK" });
  } catch (error) {
    console.error("[GET /api/health] Database connectivity check failed:", error);
    return NextResponse.json(
      { ok: false, status: "FAIL", error: "Database connectivity check failed." },
      { status: 500 }
    );
  }
}
