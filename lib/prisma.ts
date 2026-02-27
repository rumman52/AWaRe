import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

type ResolvedDatabaseUrl = {
  value: string | null;
  error: string | null;
};

const DATABASE_URL_CANDIDATES = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRESQL_URL"
] as const;

function sanitizeDatabaseUrl(value: string): string {
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

function isSupportedPostgresProtocol(databaseUrl: string): boolean {
  return databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");
}

function resolveDatabaseUrl(): ResolvedDatabaseUrl {
  let invalidPrimaryUrl: string | null = null;

  for (const envKey of DATABASE_URL_CANDIDATES) {
    const rawValue = process.env[envKey];
    if (!rawValue) {
      continue;
    }

    const candidate = sanitizeDatabaseUrl(rawValue);
    if (!candidate) {
      continue;
    }

    if (!isSupportedPostgresProtocol(candidate)) {
      if (envKey === "DATABASE_URL") {
        invalidPrimaryUrl = candidate;
      }
      continue;
    }

    try {
      // eslint-disable-next-line no-new
      new URL(candidate);
    } catch {
      if (envKey === "DATABASE_URL") {
        invalidPrimaryUrl = candidate;
      }
      continue;
    }

    return {
      value: candidate,
      error: null
    };
  }

  if (invalidPrimaryUrl) {
    return {
      value: null,
      error:
        "DATABASE_URL is set but not usable by Prisma. Use a Postgres URL beginning with postgres:// or postgresql://, or set POSTGRES_URL/POSTGRES_URL_NON_POOLING and redeploy."
    };
  }

  return {
    value: null,
    error:
      "No usable Postgres URL found. Set DATABASE_URL (or POSTGRES_URL / POSTGRES_URL_NON_POOLING) in your Vercel project settings."
  };
}

const resolvedDatabaseUrl = resolveDatabaseUrl();

if (resolvedDatabaseUrl.value && process.env.DATABASE_URL !== resolvedDatabaseUrl.value) {
  process.env.DATABASE_URL = resolvedDatabaseUrl.value;
}

export function getDatabaseConfigError(): string | null {
  if (resolvedDatabaseUrl.error) {
    return resolvedDatabaseUrl.error;
  }

  const databaseUrl = resolvedDatabaseUrl.value;

  if (!databaseUrl) {
    return "No usable database URL is configured. Set DATABASE_URL (postgresql://...) in Vercel project settings.";
  }

  if (!isSupportedPostgresProtocol(databaseUrl)) {
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
