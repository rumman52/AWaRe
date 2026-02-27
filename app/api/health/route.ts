import { NextResponse } from "next/server";
import { prisma, getDatabaseConfigError } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    return NextResponse.json({ ok: false, message: databaseConfigError }, { status: 500 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, message: "Database connection is healthy." });
  } catch (error) {
    console.error("[GET /api/health] Database health check failed:", error);
    return NextResponse.json(
      { ok: false, message: "Database connection failed. Verify DATABASE_URL and applied migrations." },
      { status: 500 }
    );
  }
}
