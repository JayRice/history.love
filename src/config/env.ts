import { z } from "zod";

// Environment validation for values inlined into the client bundle.
// Only EXPO_PUBLIC_* variables are ever readable here; secrets must
// never be added to this file or to Expo env at all.
//
// Fails loudly at startup (dev red box / production crash) rather than
// letting the app run against a missing or unsafe configuration.

const TUNNEL_HOST_PATTERN = /(ngrok|trycloudflare|loca\.lt|localtunnel)/i;

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
});

export type ClientEnv = z.infer<typeof envSchema>;

export function validateEnv(): ClientEnv {
  const parsed = envSchema.safeParse({
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\n` +
        `Copy .env.example to .env.local and fill in the required values.`
    );
  }

  const apiUrl = new URL(parsed.data.EXPO_PUBLIC_API_URL);

  if (!__DEV__) {
    if (TUNNEL_HOST_PATTERN.test(apiUrl.hostname)) {
      throw new Error(
        `Production builds must not point at a development tunnel (${apiUrl.hostname}).`
      );
    }
    if (apiUrl.protocol !== "https:") {
      throw new Error("Production API URL must use https.");
    }
  }

  return parsed.data;
}
