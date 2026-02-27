import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export function getDatabaseConfigError(): string | null {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    return "DATABASE_URL is not set. Configure a Postgres connection string in your Vercel project settings.";
  }

  const isFileUrl = databaseUrl.startsWith("file:");

  if (!isFileUrl) {
    try {
      // eslint-disable-next-line no-new
      new URL(databaseUrl);
    } catch {
      return "DATABASE_URL is invalid. Use a valid Postgres URL such as postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require.";
    }
  }

  if (process.env.VERCEL_ENV === "production" && isFileUrl) {
    return "DATABASE_URL uses a SQLite file URL, which is not supported on Vercel production. Use a managed Postgres DATABASE_URL.";
  }

  return null;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
