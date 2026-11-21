import { z } from "zod";

/**
 * Runtime Environment Variable Schema.
 * Fail-Fast principle: catches missing or malformed configuration at process initialization.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  API_SECRET_KEY: z.string().optional(),
  ENABLE_MOCK_BACKEND: z
    .any()
    .transform((val) => val === true || val === "true" || val === "1")
    .default(true),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: unknown): Env {
  return envSchema.parse(raw);
}

let envConfig: Env;

try {
  envConfig = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    ENABLE_MOCK_BACKEND: process.env.ENABLE_MOCK_BACKEND,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables detected:", error.flatten().fieldErrors);
  }
  // Safe default fallback in client environment
  const safeNodeEnv = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"
    ? process.env.NODE_ENV
    : "development";

  envConfig = {
    NODE_ENV: safeNodeEnv,
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    ENABLE_MOCK_BACKEND: true,
  };
}

export const env = envConfig;
