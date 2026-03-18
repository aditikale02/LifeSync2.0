import { spawnSync } from "node:child_process";

const isStrict = String(process.env.PREFLIGHT_STRICT || "").toLowerCase() === "true";
const npmExecPath = process.env.npm_execpath;

function resolveInvocation(command, args) {
  if (command === "npm" && npmExecPath) {
    return {
      command: process.execPath,
      args: [npmExecPath, ...args],
    };
  }

  return {
    command,
    args,
  };
}

const steps = [
  { name: "TypeScript check", command: "npm", args: ["run", "check"] },
  { name: "Frontend build", command: "npm", args: ["run", "build"] },
  { name: "Server build", command: "npm", args: ["run", "build:server"] },
  { name: "Supabase verify", command: "node", args: ["scripts/verify-supabase.mjs"], optional: !isStrict },
];

for (const step of steps) {
  console.log(`\n==> ${step.name}`);
  const invocation = resolveInvocation(step.command, step.args);
  const result = spawnSync(invocation.command, invocation.args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.error) {
    console.error(`\nPreflight failed at: ${step.name} (${result.error.message})`);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (step.optional) {
      console.warn(`\nPreflight warning at optional step: ${step.name}. Continuing in non-strict mode.`);
      continue;
    }

    console.error(`\nPreflight failed at: ${step.name}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nPreflight passed${isStrict ? " (strict mode)" : " (non-strict mode)"}: architecture and runtime checks are healthy.`);
