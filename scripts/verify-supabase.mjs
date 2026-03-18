import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY).");
  process.exit(1);
}

const supabase = createClient(url, key);

function loadDomainConfig() {
  const configPath = path.resolve(process.cwd(), "scripts", "wellness-domains.config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing domain config at ${configPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
  return {
    optionalChecks: parsed.optionalChecks ?? {},
    logicalChecks: parsed.logicalChecks ?? {},
  };
}

const { optionalChecks: OPTIONAL_CHECKS, logicalChecks: LOGICAL_CHECKS } = loadDomainConfig();

function isMissingRelationError(error) {
  return error?.code === "PGRST205" || error?.code === "42P01" || /relation|table/i.test(error?.message ?? "");
}

function isMissingColumnError(error) {
  return error?.code === "42703" || /column .* does not exist/i.test(error?.message ?? "");
}

async function checkSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("SESSION ERROR:", error.message);
    return null;
  }
  const session = data.session;
  const user = session?.user ?? null;
  console.log("Session active:", !!session);
  console.log("Current user:", user?.id ?? null);
  return user;
}

async function checkTable(table, columns) {
  const cols = columns.join(",");
  const { data, error } = await supabase.from(table).select(cols).limit(1);
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, error: null, data };
}

async function checkOptionalTable(table, columns) {
  const result = await checkTable(table, columns);
  if (result.ok) {
    console.log(`OPTIONAL TABLE OK: ${table}`);
    return true;
  }

  if (isMissingRelationError(result.error)) {
    console.warn(`OPTIONAL TABLE SKIPPED: ${table}`, result.error?.message, result.error?.code || "");
    return true;
  }

  console.error(`OPTIONAL TABLE FAILED: ${table}`, result.error?.message, result.error?.code || "");
  return false;
}

async function checkLogicalDomain(domainName, candidates) {
  let lastError = null;

  for (const candidate of candidates) {
    const result = await checkTable(candidate.table, candidate.columns);
    if (result.ok) {
      console.log(`DOMAIN OK: ${domainName} via ${candidate.table}`);
      return { ok: true };
    }

    lastError = result.error;

    if (isMissingRelationError(result.error) || isMissingColumnError(result.error)) {
      console.warn(
        `DOMAIN CANDIDATE FAILED: ${domainName} -> ${candidate.table}`,
        result.error?.message,
        result.error?.code || "",
      );
      continue;
    }

    console.error(`DOMAIN FAILED (non-fallback): ${domainName} -> ${candidate.table}`, result.error?.message, result.error?.code || "");
    return { ok: false, error: result.error };
  }

  console.error(`DOMAIN FAILED: ${domainName}`, lastError?.message || "No valid candidate found", lastError?.code || "");
  return { ok: false, error: lastError };
}

async function main() {
  console.log("Checking Supabase connection...");
  console.log("URL set:", !!url);
  console.log("Key set:", !!key);

  const user = await checkSession();

  if (!user) {
    console.warn("No user session. Table checks can still run, but inserts requiring RLS may fail.");
  }

  let optionalFailCount = 0;
  let domainOkCount = 0;
  let domainFailCount = 0;
  const failedDomains = [];

  for (const [table, cols] of Object.entries(OPTIONAL_CHECKS)) {
    const ok = await checkOptionalTable(table, cols);
    if (!ok) optionalFailCount += 1;
  }

  for (const [domain, candidates] of Object.entries(LOGICAL_CHECKS)) {
    const result = await checkLogicalDomain(domain, candidates);
    if (result.ok) domainOkCount += 1;
    else {
      domainFailCount += 1;
      failedDomains.push(domain);
    }
  }

  console.log("\nSummary:");
  console.log("Domains OK:", domainOkCount);
  console.log("Domains failed:", domainFailCount);
  console.log("Optional checks failed:", optionalFailCount);

  if (failedDomains.length > 0) {
    console.log("Failed domains list:", failedDomains.join(", "));
  }

  const missingSessionDomains = ["pomodoro_sessions", "mindfulness_sessions"];
  const hasMissingSessionDomains = missingSessionDomains.some((name) => failedDomains.includes(name));

  if (hasMissingSessionDomains) {
    console.log("\nRecommended unblock action:");
    console.log("1) Apply migration: supabase/migrations/20260316_lifesync_missing_session_tables.sql");
    console.log("2) Re-run: npm run verify:supabase && npm run preflight:strict");
  }

  if (domainFailCount > 0 || optionalFailCount > 0) process.exit(2);
}

main().catch((e) => {
  console.error("Verification script failed:", e);
  process.exit(1);
});
