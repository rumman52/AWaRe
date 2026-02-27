import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma, getDatabaseConfigError } from "@/lib/prisma";

export const runtime = "nodejs";

const requiredTables = [
  "Antibiotic",
  "InfectionGuide",
  "Case",
  "Recommendation",
  "AuditLog",
  "MetricDaily"
] as const;

export async function GET() {
  const databaseConfigError = getDatabaseConfigError();
  if (databaseConfigError) {
    return NextResponse.json({ ok: false, message: databaseConfigError }, { status: 500 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const existingTables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    const existingTableSet = new Set(existingTables.map((row) => row.table_name));
    const missingTables = requiredTables.filter((table) => !existingTableSet.has(table));

    if (missingTables.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "Database schema is missing required tables.",
          missingTables,
          action: "Run `npx prisma migrate deploy` and `npx prisma db seed`."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Database connection is healthy and required tables are present." });
  } catch (error) {
    console.error("[GET /api/health] Database health check failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        {
          ok: false,
          message: "Database schema is missing required tables.",
          action: "Run `npx prisma migrate deploy` and `npx prisma db seed`."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Database connection failed. Verify DATABASE_URL and applied migrations." },
      { status: 500 }
    );
  }
}
