#!/usr/bin/env node
// Migration safety check (Phase 0A, task 6).
// Fails the build when known footguns reappear in tracked source:
//   1. DEV_MODE flags
//   2. Development tunnel URLs / emulator hosts
//   3. Server-side secrets (Supabase service role, access tokens)
//   4. Private keys or Firebase admin credentials
//   5. Transport-security relaxation (ATS / cleartext)
//
// Usage: node scripts/check-migration-safety.mjs
// Exits 1 with a file:line report on any violation.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const CHECKS = [
  { name: "DEV_MODE flag", pattern: /\bDEV_MODE\s*=/ },
  {
    name: "development tunnel or emulator host",
    pattern: /ngrok|trycloudflare|localtunnel|loca\.lt\b|10\.0\.2\.2/i,
  },
  {
    name: "server-side secret",
    pattern: /service_role|sb_secret_|sbp_[A-Za-z0-9]{16,}/,
  },
  {
    name: "private key or admin credential",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----|firebase-adminsdk/,
  },
  {
    name: "transport-security relaxation",
    pattern: /NSAllowsArbitraryLoads|usesCleartextTraffic/,
  },
];

// Only scan code and config that ships or configures the app.
const SCAN_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|json|plist|gradle|xml|toml|yml|yaml)$/;

const EXCLUDED = [
  /^docs\//, // documentation may cite the removed footguns as evidence
  /^scripts\/check-migration-safety\.mjs$/, // this file names the patterns
  /^src\/shared\/config\/env\.ts$/, // contains the tunnel pattern as a runtime guard
  /^supabase\/config\.toml$/, // CLI-generated; names Data API roles in comments, no secrets
  /^package-lock\.json$/,
  /^\.env\.example$/,
  /^assets\//,
];

const files = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => SCAN_EXTENSIONS.test(f))
  .filter((f) => !EXCLUDED.some((rx) => rx.test(f)));

let violations = 0;

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue; // deleted in working tree
  }
  const lines = content.split("\n");
  for (const { name, pattern } of CHECKS) {
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        violations += 1;
        console.error(`${file}:${i + 1}: ${name}: ${line.trim().slice(0, 120)}`);
      }
    });
  }
}

if (violations > 0) {
  console.error(`\nMigration safety check FAILED: ${violations} violation(s).`);
  process.exit(1);
}

console.log(`Migration safety check passed (${files.length} files scanned).`);
