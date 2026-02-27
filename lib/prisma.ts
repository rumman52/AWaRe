import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export function getDatabaseConfigError(): string | null {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    return "DATABASE_URL is not set. Configure a Postgres connection string (postgresql://...) in your Vercel project settings.";
  }

  const isPostgresUrl = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

  if (!isPostgresUrl) {
    return "DATABASE_URL must start with postgres:// or postgresql://. Example: postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require.";
  }

  try {
    // eslint-disable-next-line no-new
    new URL(databaseUrl);
  } catch {
    return "DATABASE_URL is invalid. Use a valid Postgres URL such as postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require.";
  }

  return null;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
